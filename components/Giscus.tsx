"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";

export default function Giscus() {
  const ref = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();

  // 테마 설정 (라이트/다크 모드)
  const theme = resolvedTheme === "dark" ? "dark" : "light";

  useEffect(() => {
    if (!ref.current || ref.current.hasChildNodes()) return;

    const load = () => {
      if (!ref.current || ref.current.hasChildNodes()) return;
      const scriptElem = document.createElement("script");
      scriptElem.src = "https://giscus.app/client.js";
      scriptElem.async = true;
      scriptElem.crossOrigin = "anonymous";
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
      // lazy 로딩을 해제해 뷰포트 진입을 기다리지 않게 함
      ref.current.appendChild(scriptElem);
    };

    // 초기 렌더 직후, 브라우저가 여유 있을 때 빠르게 로드
    if ("requestIdleCallback" in window) {
      // Lighthouse 영향을 줄이기 위해 짧은 타임아웃으로 idle에 스케줄
      window.requestIdleCallback(load, { timeout: 500 });
    } else {
      setTimeout(load, 400);
    }
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
    <div className="mt-10" data-toc-exclude>
      <section ref={ref} />
    </div>
  );
}
