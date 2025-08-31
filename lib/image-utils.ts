/**
 * Notion image 프록시 URL 생성: block_id 기반으로 고정 경로 사용
 * 형태: /api/image/[blockId]/[fileName]
 */
export function getProxyImageUrl(blockId: string, fileName?: string): string {
  const safeName = sanitizeFileName(fileName || "image");
  return `/api/image/${encodeURIComponent(blockId)}/${encodeURIComponent(
    safeName
  )}`;
}

/**
 * 이미지 URL 최적화 처리
 * Notion API 이미지인 경우 Next.js Image 최적화를 통해 AVIF/WebP 변환
 */
export function getOptimizedImageUrl(src: string): string {
  // Notion API 이미지인 경우 (_next/image를 통해 최적화)
  if (src.startsWith("/api/image/")) {
    // Next/Image가 품질/포맷 최적화를 담당하도록 쿼리 파라미터를 추가하지 않습니다.
    return src;
  }

  // 외부 이미지는 그대로 사용 (remotePatterns에 등록된 경우 자동 최적화됨)
  return src;
}

/**
 * 이미지 URL에서 블러 데이터 URL 생성
 */
export function generateBlurDataURL(
  width: number = 8,
  height: number = 6
): string {
  const canvas =
    typeof window !== "undefined"
      ? document.createElement("canvas")
      : ({ toDataURL: () => "" } as HTMLCanvasElement);

  if (typeof window === "undefined") {
    // SSR에서는 기본 SVG 블러 반환
    return `data:image/svg+xml;base64,${Buffer.from(
      `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#e2e8f0"/>
      </svg>`
    ).toString("base64")}`;
  }

  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, "#e2e8f0");
    gradient.addColorStop(1, "#cbd5e1");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  return canvas.toDataURL();
}

// 내부 유틸
function extractFileName(urlString: string): string | null {
  try {
    const url = new URL(urlString);
    const last = url.pathname.split("/").filter(Boolean).pop();
    if (!last) return null;
    // URL 디코딩 및 너무 긴 토큰 방지
    const name = decodeURIComponent(last);
    // 쿼리 제거 (URL 객체 사용 중이라 일반적으로 없음)
    return name || null;
  } catch (e) {
    console.error("이미지 URL 처리 실패:", e);
    return null;
  }
}

function sanitizeFileName(name: string): string {
  // 공백/제어문자 제거 및 간단 정규화
  return name.replace(/[\n\r\t]/g, " ").slice(0, 120);
}

export function fileNameFromUrl(
  url: string | undefined | null
): string | undefined {
  if (!url) return undefined;
  return extractFileName(url) || undefined;
}
