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

    // IntersectionObserver로 활성 헤딩 추적 (강제 리플로우 완화)
    const observer = new IntersectionObserver(
      (entries) => {
        // 가장 화면에 가깝게 보이는 헤딩을 선택
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        const top =
          visible[0] ||
          entries.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top
          )[0];
        if (top) {
          const id = top.target.getAttribute("id") || "";
          if (id && id !== activeId) setActiveId(id);
        }
      },
      {
        rootMargin: "-100px 0px -66% 0px",
        threshold: [0, 1],
      }
    );

    contentHeadings.forEach((el) => observer.observe(el));

    // 초기 활성 ID 설정
    if (contentHeadings[0]?.id) setActiveId(contentHeadings[0].id);

    return () => observer.disconnect();
  }, [activeId]);

  useEffect(() => {
    if (!activeId || !navRef.current) return;
    const activeElement = navRef.current.querySelector<HTMLAnchorElement>(
      `a[href="#${activeId}"]`
    );
    if (!activeElement) return;

    // 읽기 작업을 rAF로 모아서 리플로우 최소화
    requestAnimationFrame(() => {
      setActiveStyles({
        top: activeElement.offsetTop,
        height: activeElement.offsetHeight,
      });
      const navElement = navRef.current!;
      const isTopVisible = activeElement.offsetTop >= navElement.scrollTop;
      const isBottomVisible =
        activeElement.offsetTop + activeElement.offsetHeight <=
        navElement.scrollTop + navElement.clientHeight;
      if (!isTopVisible || !isBottomVisible) {
        activeElement.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
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
                if (element) {
                  window.scrollTo({
                    top: (element as HTMLElement).offsetTop - 100,
                    behavior: "smooth",
                  });
                  setActiveId(heading.id);
                }
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
