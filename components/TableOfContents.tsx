"use client";

import { useEffect, useState, useRef, useCallback } from "react";
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

  const handleScroll = useCallback(() => {
    const headingElements = Array.from(
      document.querySelectorAll("h1[id], h2[id], h3[id]")
    );

    if (headingElements.length === 0) return;

    const scrollThreshold = window.scrollY + 100;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;
    const lastElement = headingElements[headingElements.length - 1] as HTMLElement;

    const isNearBottom =
      window.scrollY + clientHeight >= scrollHeight - 10 || 
      lastElement.offsetTop <= scrollThreshold; 

    let newActiveId = "";

    if (isNearBottom) {
      newActiveId = lastElement.id;
    } else {
      for (let i = headingElements.length - 1; i >= 0; i--) {
        const element = headingElements[i] as HTMLElement;
        if (element.offsetTop <= scrollThreshold) {
          newActiveId = element.id;
          break;
        }
      }
      if (!newActiveId && headingElements.length > 0) {
        newActiveId = headingElements[0].id;
      }
    }

    setActiveId((currentActiveId) => {
      if (newActiveId && newActiveId !== currentActiveId) {
        return newActiveId;
      }
      return currentActiveId;
    });
  }, []);

  useEffect(() => {
    const headingElementsRaw = Array.from(
      document.querySelectorAll("h1, h2, h3")
    );

    const contentHeadings = headingElementsRaw.filter((heading) => {
      if (heading.tagName === "H1" && heading.closest("header")) {
        return false;
      }
      return true;
    });

    const tocHeadings = contentHeadings.map((heading) => {
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

    // 스크롤 이벤트 리스너 등록 및 초기 실행
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // 초기 활성 ID 설정

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    if (activeId && navRef.current) {
      const activeElement = navRef.current.querySelector<HTMLAnchorElement>(
        `a[href="#${activeId}"]`
      );
      if (activeElement) {
        const navElement = navRef.current;

        setActiveStyles({
          top: activeElement.offsetTop,
          height: activeElement.offsetHeight,
        });

        const isTopVisible = activeElement.offsetTop >= navElement.scrollTop;
        const isBottomVisible =
          activeElement.offsetTop + activeElement.offsetHeight <=
          navElement.scrollTop + navElement.clientHeight;

        if (!isTopVisible || !isBottomVisible) {
          activeElement.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }
      }
    }
  }, [activeId, headings]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <nav className="text-sm relative" ref={navRef}>
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
        {headings.map((heading, index) => (
          <li
            key={index}
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
