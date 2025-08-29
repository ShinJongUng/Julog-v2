/**
 * 이미지 URL을 그대로 반환합니다.
 * 기존의 프록시(/api/image-proxy) 사용을 제거하여 Next/Image가 직접 최적화하도록 변경.
 */
export function getOptimizedImageUrl(src: string): string {
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
