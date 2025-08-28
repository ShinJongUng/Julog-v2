"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { MessageCircle } from "lucide-react";

export default function Giscus() {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  // 테마 설정 (라이트/다크 모드)
  const theme = resolvedTheme === "dark" ? "dark" : "light";

  useEffect(() => {
    // 이미 로드된 경우 중복 로드 방지
    if (!ref.current || ref.current.hasChildNodes()) return;

    const scriptElem = document.createElement("script");
    scriptElem.src = "https://giscus.app/client.js";
    scriptElem.async = true;
    scriptElem.crossOrigin = "anonymous";

    // GitHub 저장소 정보 설정
    scriptElem.setAttribute(
      "data-repo",
      process.env.NEXT_PUBLIC_GISCUS_REPO || ""
    );
    scriptElem.setAttribute(
      "data-repo-id",
      process.env.NEXT_PUBLIC_GISCUS_REPO_ID || ""
    );
    scriptElem.setAttribute(
      "data-category",
      process.env.NEXT_PUBLIC_GISCUS_CATEGORY || ""
    );
    scriptElem.setAttribute(
      "data-category-id",
      process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || ""
    );
    scriptElem.setAttribute("data-mapping", "pathname");
    scriptElem.setAttribute("data-strict", "0");
    scriptElem.setAttribute("data-reactions-enabled", "1");
    scriptElem.setAttribute("data-emit-metadata", "0");
    scriptElem.setAttribute("data-input-position", "bottom");
    scriptElem.setAttribute("data-theme", theme);
    scriptElem.setAttribute("data-lang", "ko");
    scriptElem.setAttribute("data-loading", "lazy");

    // Intersection Observer로 뷰포트 진입 시에만 스크립트 로드 (bfcache 문제 해결)
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            ref.current?.appendChild(scriptElem);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    // 약간의 지연 후 observer 시작 (페이지 로드 성능 개선)
    setTimeout(() => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    }, 1000);
  }, [theme]);

  // 테마 변경 시 giscus 테마도 업데이트
  useEffect(() => {
    const iframe = document.querySelector<HTMLIFrameElement>(
      "iframe.giscus-frame"
    );
    iframe?.contentWindow?.postMessage(
      { giscus: { setConfig: { theme } } },
      "https://giscus.app"
    );
  }, [theme]);

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="text-green-600" />
        <h2 className="text-2xl font-bold">댓글</h2>
      </div>
      <section ref={ref} />
    </div>
  );
}
