"use client";

import Image from "next/image";
import React from "react";

type Props = {
  videoId: string;
  title?: string;
  /**
   * 가시영역 진입 시("view") 또는 클릭 시("click")에 iframe 로드
   */
  loadOn?: "view" | "click";
  /**
   * 썸네일을 표시할지 여부. false면 단색 배경 + 재생버튼만 표시
   */
  showThumbnail?: boolean;
  /**
   * 16:9 외 다른 비율을 쓰고 싶을 때 지정 (예: 4/3)
   */
  aspectRatio?: `${number}/${number}`;
};

function getThumbUrl(id: string) {
  // 고퀄 썸네일이 없을 수 있어, 순서대로 fallback
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}

export default function YouTubeEmbedLazy({
  videoId,
  title,
  loadOn = "view",
  showThumbnail = true,
  aspectRatio = "16/9",
}: Props) {
  const [activated, setActivated] = React.useState(false);
  const [loaded, setLoaded] = React.useState(false);
  const [inViewOnce, setInViewOnce] = React.useState(false);
  const ref = React.useRef<HTMLDivElement | null>(null);

  // 뷰포트 진입 시 활성화 (loadOn === 'view')
  React.useEffect(() => {
    if (loadOn !== "view" || inViewOnce) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActivated(true);
            setInViewOnce(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px 0px", threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadOn, inViewOnce]);

  const handleActivate = () => {
    setActivated(true);
  };

  const embedSrc = `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`; // 개인정보 고려

  return (
    <div className="my-6 not-prose">
      <div
        ref={ref}
        className="relative w-full overflow-hidden rounded-xl bg-black/80"
        style={{ aspectRatio }}
      >
        {/* 썸네일: 활성화 전 또는 iframe 로딩 중에 표시 */}
        {showThumbnail && (
          <Image
            src={getThumbUrl(videoId)}
            alt={title || "YouTube thumbnail"}
            fill
            loading="lazy"
            sizes="(min-width: 1024px) 736px, 100vw"
            className="absolute inset-0 object-cover"
            style={{
              opacity: activated && loaded ? 0 : 1,
              transition: "opacity .3s ease",
            }}
          />
        )}

        {/* 클릭 로드 모드에서만 플레이 버튼 버튼화 */}
        {!activated && (
          <button
            type="button"
            aria-label="재생"
            onClick={loadOn === "click" ? handleActivate : undefined}
            className="absolute inset-0 h-full w-full"
            style={{ cursor: loadOn === "click" ? "pointer" : "default" }}
          >
            {/* 접근성: JS 비활성화/오류 시 유튜브로 이동 가능한 링크 제공 */}
            <noscript>
              <a
                href={`https://www.youtube.com/watch?v=${videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 block"
                aria-label="YouTube에서 보기"
              />
            </noscript>
            {/* 재생 버튼 오버레이 */}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-black/60 ring-1 ring-white/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="white"
                  className="h-8 w-8"
                  aria-hidden
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
          </button>
        )}

        {/* iframe (활성화 이후 마운트), 로딩 완료 전까지 투명도 0 */}
        {activated && (
          <iframe
            src={embedSrc}
            title={title || "YouTube video"}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
            onLoad={() => setLoaded(true)}
            style={{ opacity: loaded ? 1 : 0, transition: "opacity .2s ease" }}
          />
        )}

        {/* 로딩 스피너 */}
        {activated && !loaded && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="h-10 w-10 rounded-full border-2 border-white/70 border-t-transparent animate-spin" />
          </span>
        )}
      </div>
      {/* SEO/접근성: 항상 실제 YouTube 링크를 제공 */}
      <div className="mt-2 text-center text-sm text-muted-foreground">
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground"
        >
          YouTube에서 바로 보기
        </a>
      </div>
    </div>
  );
}
