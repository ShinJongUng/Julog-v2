/**
 * Notion 이미지 URL을 프록시 URL로 변환
 * Notion 이미지는 임시 URL이고 CORS 문제가 있어서 프록시를 통해 처리
 */
export function getOptimizedImageUrl(notionImageUrl: string): string {
  // Notion 이미지 URL인지 확인
  if (notionImageUrl.includes("prod-files-secure.s3.us-west-2.amazonaws.com")) {
    return `/api/image-proxy?url=${encodeURIComponent(notionImageUrl)}`;
  }

  // 일반 이미지 URL은 그대로 반환
  return notionImageUrl;
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
