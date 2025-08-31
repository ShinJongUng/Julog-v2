import { NextResponse } from "next/server";

// 이미지 변환을 위해 Node 런타임 사용 (sharp 사용 가능)
export const runtime = "nodejs";

// 메모리 캐시 (서버 재시작 시까지 유지). key = blockId
const urlCache = new Map<string, { url: string; expiry: number }>();

const NOTION_API_BASE = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

async function resolveSignedUrlFromBlock(
  blockId: string
): Promise<string | null> {
  try {
    const cached = urlCache.get(blockId);
    const now = Date.now();
    if (cached && now < cached.expiry) return cached.url;

    const token = process.env.NOTION_TOKEN;
    if (!token) {
      console.error("NOTION_TOKEN is not set");
      return null;
    }

    const res = await fetch(`${NOTION_API_BASE}/blocks/${blockId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Notion-Version": NOTION_VERSION,
        Accept: "application/json",
      },
      // small timeout guard via signal if needed (left simple)
      cache: "no-store",
    });

    if (!res.ok) {
      console.error(`Notion API error: ${res.status} ${res.statusText}`);
      return null;
    }
    const data = await res.json();
    const type = data.type as string | undefined;

    let url: string | null = null;
    if (type === "image" && data.image) {
      if (data.image.type === "file") url = data.image.file?.url ?? null;
      else if (data.image.type === "external")
        url = data.image.external?.url ?? null;
    } else if (type === "file" && data.file) {
      if (data.file.type === "file") url = data.file.file?.url ?? null;
      else if (data.file.type === "external")
        url = data.file.external?.url ?? null;
    } else if (type === "pdf" && data.pdf) {
      if (data.pdf.type === "file") url = data.pdf.file?.url ?? null;
      else if (data.pdf.type === "external")
        url = data.pdf.external?.url ?? null;
    } else if (type === "video" && data.video) {
      if (data.video.type === "file") url = data.video.file?.url ?? null;
      else if (data.video.type === "external")
        url = data.video.external?.url ?? null;
    }

    if (!url) return null;

    // 55분 캐시 저장 (Notion URL은 1시간 전후 만료)
    urlCache.set(blockId, { url, expiry: now + 55 * 60 * 1000 });
    return url;
  } catch (e) {
    console.error("resolveSignedUrlFromBlock error", e);
    return null;
  }
}

function successHeaders(contentType: string) {
  return {
    "Content-Type": contentType,
    // 더 긴 캐시 시간과 효율적인 stale-while-revalidate로 캐시 히트율 향상
    "Cache-Control":
      "public, s-maxage=31536000, max-age=31536000, immutable, stale-while-revalidate=2592000", // 30일 stale
    // Accept 헤더만으로 Vary하여 캐시 효율성 극대화
    Vary: "Accept",
    // 이미지 최적화 힌트
    "Accept-CH": "DPR, Width, Viewport-Width",
  } as Record<string, string>;
}

function errorHeaders() {
  return {
    "Cache-Control": "public, s-maxage=60, max-age=60",
    Vary: "Accept",
  } as Record<string, string>;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ blockId: string; fileName?: string }> }
) {
  try {
    const { blockId } = await context.params;

    const notionImageUrl = await resolveSignedUrlFromBlock(blockId);
    if (!notionImageUrl) {
      return new NextResponse("이미지를 찾을 수 없습니다", {
        status: 404,
        headers: errorHeaders(),
      });
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const imageResponse = await fetch(notionImageUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          Accept: "image/*,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
      });
      clearTimeout(timeoutId);

      if (!imageResponse.ok) {
        console.error(
          `이미지 다운로드 실패: ${imageResponse.status} ${imageResponse.statusText}`
        );
        return new NextResponse("이미지 다운로드 실패", {
          status: 502,
          headers: errorHeaders(),
        });
      }

      const originalArrayBuffer = await imageResponse.arrayBuffer();
      const originalBuffer = Buffer.from(originalArrayBuffer);
      const originalContentType =
        imageResponse.headers.get("content-type") || "image/jpeg";

      // 브라우저의 Accept 헤더 기반으로 최적 포맷 결정
      const accept = request.headers.get("accept") || "";
      const prefersAvif = /image\/avif/i.test(accept);
      const prefersWebp = /image\/webp/i.test(accept);

      // 선택적 리사이즈/품질 파라미터 (직접 접근 시 활용 가능)
      const url = new URL(request.url);
      const wParam = url.searchParams.get("w");
      const qParam = url.searchParams.get("q");
      const width = wParam
        ? Math.max(1, Math.min(3840, parseInt(wParam, 10)))
        : undefined;
      const quality = qParam
        ? Math.max(30, Math.min(95, parseInt(qParam, 10)))
        : 75;

      // GIF(특히 애니메이션) 등은 원본 그대로 전달
      if (/image\/gif/i.test(originalContentType)) {
        return new NextResponse(originalBuffer, {
          headers: successHeaders(originalContentType),
        });
      }

      try {
        const sharpMod = await import("sharp");
        const sharp = sharpMod.default(originalBuffer, { failOnError: false });

        if (width) sharp.resize({ width, withoutEnlargement: true });

        let outBuffer: Buffer;
        let outType: string = originalContentType;

        if (prefersAvif) {
          outBuffer = await sharp.avif({ quality, effort: 4 }).toBuffer();
          outType = "image/avif";
        } else if (prefersWebp) {
          outBuffer = await sharp.webp({ quality }).toBuffer();
          outType = "image/webp";
        } else {
          // 포맷 선호가 없으면 원본 유지하면서 품질/리사이즈만 적용
          if (/image\/png/i.test(originalContentType)) {
            outBuffer = await sharp.png({ quality }).toBuffer();
            outType = "image/png";
          } else {
            outBuffer = await sharp.jpeg({ quality, mozjpeg: true }).toBuffer();
            outType = "image/jpeg";
          }
        }

        const outArrayBuffer = outBuffer.buffer.slice(
          outBuffer.byteOffset,
          outBuffer.byteOffset + outBuffer.byteLength
        );
        return new NextResponse(outArrayBuffer as ArrayBuffer, {
          headers: successHeaders(outType),
        });
      } catch (e) {
        // sharp 변환 실패 시 원본 전달 (안전망)
        console.warn("이미지 변환 실패, 원본 전달:", e);
        const origArrayBuffer = originalBuffer.buffer.slice(
          originalBuffer.byteOffset,
          originalBuffer.byteOffset + originalBuffer.byteLength
        );
        return new NextResponse(origArrayBuffer, {
          headers: successHeaders(originalContentType),
        });
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        console.error("이미지 다운로드 타임아웃:", notionImageUrl);
        return new NextResponse("이미지 다운로드 타임아웃", {
          status: 504,
          headers: errorHeaders(),
        });
      }
      console.error("이미지 fetch 오류:", fetchError);
      return new NextResponse("이미지 다운로드 실패", {
        status: 502,
        headers: errorHeaders(),
      });
    }
  } catch (error) {
    console.error("이미지 프록시 오류:", error);
    return new NextResponse("서버 오류", {
      status: 500,
      headers: errorHeaders(),
    });
  }
}
