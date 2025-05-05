"use client";

import { useState, useEffect } from "react";
import { FaArrowUp, FaArrowDown, FaComment, FaEllipsisV } from "react-icons/fa";

interface FloatingButtonsProps {
  commentSectionId?: string;
}

export default function FloatingButtons({
  commentSectionId = "comments",
}: FloatingButtonsProps) {
  const [showButtons, setShowButtons] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowButtons(true);
      } else {
        setShowButtons(false);
        setIsExpanded(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  };

  const scrollToComments = () => {
    const commentSection = document.getElementById(commentSectionId);
    if (commentSection) {
      commentSection.scrollIntoView({ behavior: "smooth" });

      setTimeout(
        () => commentSection.classList.remove("comment-highlight"),
        1000
      );
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  if (!showButtons) return null;

  const buttonClass =
    "rounded-full bg-green-600/80 hover:bg-green-700 text-white p-3 shadow-md transition-all duration-300";

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end gap-3 z-50">
      <div
        className={`flex flex-col gap-3 origin-bottom-right overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded
            ? "max-h-[200px] opacity-100 translate-y-0 mb-3"
            : "max-h-0 opacity-0 translate-y-10 mb-0"
        }`}
      >
        <button
          onClick={scrollToTop}
          className={`${buttonClass} transform transition-transform duration-500 ${
            isExpanded ? "scale-100" : "scale-0"
          }`}
          aria-label="맨 위로 이동"
          style={{ transitionDelay: isExpanded ? "0.1s" : "0s" }}
        >
          <FaArrowUp />
        </button>

        <button
          onClick={scrollToComments}
          className={`${buttonClass} transform transition-transform duration-500 ${
            isExpanded ? "scale-100" : "scale-0"
          }`}
          aria-label="댓글로 이동"
          style={{ transitionDelay: isExpanded ? "0.2s" : "0s" }}
        >
          <FaComment />
        </button>

        <button
          onClick={scrollToBottom}
          className={`${buttonClass} transform transition-transform duration-500 ${
            isExpanded ? "scale-100" : "scale-0"
          }`}
          aria-label="맨 아래로 이동"
          style={{ transitionDelay: isExpanded ? "0.3s" : "0s" }}
        >
          <FaArrowDown />
        </button>
      </div>

      {/* 토글 버튼 */}
      <button
        onClick={toggleExpand}
        className={`${buttonClass} transition-all duration-500 ${
          isExpanded ? "rotate-180 bg-green-700" : "rotate-0"
        }`}
        aria-label="메뉴 접고 펼치기"
      >
        <FaEllipsisV />
      </button>
    </div>
  );
}
