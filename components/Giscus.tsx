"use client";

import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { FaComment } from "react-icons/fa";

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
    scriptElem.setAttribute("data-repo", "ShinJongUng/Julog-v2");
    scriptElem.setAttribute("data-repo-id", "R_kgDOOkm8bg");
    scriptElem.setAttribute("data-category", "General"); // GitHub 카테고리 설정
    scriptElem.setAttribute("data-category-id", "DIC_kwDOOkm8bs4CcoQd"); // GitHub에서 설정한 카테고리 ID
    scriptElem.setAttribute("data-mapping", "pathname");
    scriptElem.setAttribute("data-strict", "0");
    scriptElem.setAttribute("data-reactions-enabled", "1");
    scriptElem.setAttribute("data-emit-metadata", "0");
    scriptElem.setAttribute("data-input-position", "bottom");
    scriptElem.setAttribute("data-theme", theme);
    scriptElem.setAttribute("data-lang", "ko");
    scriptElem.setAttribute("data-loading", "lazy");

    ref.current.appendChild(scriptElem);
  }, []);

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
        <FaComment className="text-green-600" />
        <h2 className="text-2xl font-bold">댓글</h2>
      </div>
      <section ref={ref} />
    </div>
  );
}
