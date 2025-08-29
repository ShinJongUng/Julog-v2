"use client";

import { useEffect, useState, useRef } from "react";

interface TOCHeading {
  id: string;
  text: string;
  level: number;
}

export default function TableOfContents() {
  const [headings, setHeadings] = useState<TOCHeading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const navRef = useRef<HTMLElement>(null);
  const [activeStyles, setActiveStyles] = useState({ top: 0, height: 0 });

  useEffect(() => {
    // 작은 화면에서는 TOC를 렌더하지 않으므로 초기 작업 스킵
    if (typeof window !== "undefined") {
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      if (!isDesktop) return;
    }

    const init = () => {
      const headingElementsRaw = Array.from(
        document.querySelectorAll("h1, h2, h3")
      );

      const contentHeadings = headingElementsRaw.filter((heading) => {
        if (heading.tagName === "H1" && heading.closest("header")) return false;
        return true;
      });

      const tocHeadings = contentHeadings.map((heading) => {
        if (!heading.id) {
          heading.id =
            heading.textContent
              ?.toLowerCase()
              .replace(/\s+/g, "-")
              .replace(/[^\w-]/g, "") ||
            `heading-${Math.random().toString(36).slice(2, 11)}`;
        }
        return {
          id: heading.id,
          text: heading.textContent || "",
          level: parseInt(heading.tagName.charAt(1)),
        };
      });
      setHeadings(tocHeadings);

      // IntersectionObserver로 활성 헤딩 추적 (가벼운 기준)
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const id = entry.target.getAttribute("id") || "";
              if (id) setActiveId(id);
            }
          });
        },
        { rootMargin: "0px 0px -60% 0px", threshold: 0 }
      );

      contentHeadings.forEach((el) => observer.observe(el));

      // 초기 활성 ID 설정 (첫 번째 헤딩)
      if (contentHeadings[0]?.id) setActiveId(contentHeadings[0].id);

      return () => {
        observer.disconnect();
      };
    };

    // 초기 콘텐츠 페인트 이후로 지연해 메인 경로에서 제거
    let cleanup: (() => void) | undefined;
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const id = window.requestIdleCallback(
        () => {
          cleanup = init() as unknown as (() => void) | undefined;
        },
        { timeout: 1500 }
      );
      return () => {
        window.cancelIdleCallback?.(id);
        cleanup?.();
      };
    } else {
      const t = setTimeout(() => {
        cleanup = init() as unknown as (() => void) | undefined;
      }, 600);
      return () => {
        clearTimeout(t);
        cleanup?.();
      };
    }
  }, []);

  useEffect(() => {
    // 작은 화면에서는 동작하지 않음
    if (typeof window !== "undefined") {
      const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
      if (!isDesktop) return;
    }

    if (!activeId || !navRef.current) return;
    const activeElement = navRef.current.querySelector<HTMLAnchorElement>(
      `a[href="#${activeId}"]`
    );
    if (!activeElement) return;

    // 읽기 작업을 rAF로 묶고, 최소한의 DOM 읽기만 수행
    requestAnimationFrame(() => {
      const top = activeElement.offsetTop;
      const height = activeElement.offsetHeight;
      setActiveStyles({ top, height });
    });
  }, [activeId]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="text-sm relative" ref={navRef}>
      {activeId && (
        <div
          className="absolute w-[calc(100%-8px)] bg-green-50 dark:bg-green-900/20 rounded z-0 transition-all"
          style={{
            top: activeStyles.top,
            height: activeStyles.height,
            left: 4,
          }}
        />
      )}

      <ul className="space-y-2 relative z-10">
        {headings.map((heading, index) => (
          <li
            key={index}
            style={{ paddingLeft: `${(heading.level - 1) * 0.75}rem` }}
          >
            <a
              href={`#${heading.id}`}
              className={`block py-1 px-2 rounded transition-colors hover:bg-green-100 dark:hover:bg-green-900/30 relative z-10 ${
                activeId === heading.id
                  ? "text-green-600 dark:text-green-400 font-medium"
                  : "text-foreground/80 hover:text-foreground"
              }`}
              onClick={(e) => {
                e.preventDefault();
                const element = document.getElementById(heading.id);
                if (!element) return;
                const y =
                  element.getBoundingClientRect().top + window.scrollY - 100;
                window.scrollTo({ top: y, behavior: "smooth" });
                // activeId는 IntersectionObserver가 스크롤 진행 순서대로 업데이트하도록 둡니다.
              }}
            >
              <span>{heading.text}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
