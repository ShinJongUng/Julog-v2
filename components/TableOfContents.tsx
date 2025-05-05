"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    const headingElements = Array.from(document.querySelectorAll("h1, h2, h3"));

    const contentHeadings = headingElements.filter((heading) => {
      if (heading.tagName === "H1" && heading.closest("header")) {
        return false;
      }
      return true;
    });

    // 제목 요소들을 TOCHeading 배열로 변환
    const tocHeadings = contentHeadings.map((heading) => {
      // 각 제목 요소에 id가 없으면 텍스트 기반으로 id 생성
      if (!heading.id) {
        heading.id =
          heading.textContent
            ?.toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w-]/g, "") ||
          `heading-${Math.random().toString(36).substr(2, 9)}`;
      }

      return {
        id: heading.id,
        text: heading.textContent || "",
        level: parseInt(heading.tagName.charAt(1)), // h1=1, h2=2, h3=3
      };
    });

    setHeadings(tocHeadings);

    // 스크롤 이벤트에 따라 현재 활성화된 제목을 업데이트하는 함수
    const handleScroll = () => {
      const headingElements = Array.from(
        document.querySelectorAll("h1[id], h2[id], h3[id]")
      );

      // 화면 상단에서부터 1/3 지점을 기준으로 계산
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      // 현재 스크롤 위치보다 위에 있는 마지막 제목 찾기
      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i];
        if ((element as HTMLElement).offsetTop <= scrollPosition) {
          setActiveId(element.id);
          return;
        }
      }

      // 모든 제목이 스크롤 위치보다 아래에 있으면 첫 번째 제목 활성화
      if (headingElements.length > 0) {
        setActiveId(headingElements[0].id);
      }
    };

    // 초기 실행 및 스크롤 이벤트 리스너 등록
    handleScroll();
    window.addEventListener("scroll", handleScroll);

    // 컴포넌트가 언마운트될 때 이벤트 리스너 제거
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // 활성 항목이 변경되면 스크롤하여 항목을 표시하는 함수
  useEffect(() => {
    if (activeId && navRef.current) {
      const activeElement = navRef.current.querySelector(
        `a[href="#${activeId}"]`
      );
      if (activeElement) {
        const navRect = navRef.current.getBoundingClientRect();
        const activeRect = activeElement.getBoundingClientRect();

        // 배경 애니메이션을 위한 위치와 높이 설정
        setActiveStyles({
          top: activeRect.top - navRect.top,
          height: activeRect.height,
        });

        // 활성 항목이 네비게이션 영역을 벗어났는지 확인
        if (
          activeRect.top < navRect.top ||
          activeRect.bottom > navRect.bottom
        ) {
          activeElement.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }
      }
    }
  }, [activeId]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="text-sm relative" ref={navRef}>
      {/* 선택 표시자 - 활성 항목 뒤에 표시되는 배경 */}
      <AnimatePresence>
        {activeId && (
          <motion.div
            className="absolute w-[calc(100%-8px)] bg-green-50 dark:bg-green-900/20 rounded z-0"
            layoutId="activeHeadingBackground"
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
              duration: 0.3,
            }}
            style={{
              top: activeStyles.top,
              height: activeStyles.height,
              left: 4,
            }}
          />
        )}
      </AnimatePresence>

      <ul className="space-y-2 relative z-10">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 1) * 0.75}rem` }}
          >
            <motion.a
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
                    top: (element as HTMLElement).offsetTop - 100, // 100px 위쪽으로 스크롤 (여백)
                    behavior: "smooth",
                  });
                  setActiveId(heading.id);
                }
              }}
              initial={{ opacity: 0.8 }}
              animate={{
                opacity: 1,
                transition: { duration: 0.3 },
              }}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.span
                animate={{
                  color:
                    activeId === heading.id
                      ? "var(--color-green-600)"
                      : "var(--color-foreground-80)",
                }}
                transition={{ duration: 0.3 }}
              >
                {heading.text}
              </motion.span>
            </motion.a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
