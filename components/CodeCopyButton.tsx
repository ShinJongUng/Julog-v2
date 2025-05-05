"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CodeCopyButtonProps {
  code: string;
}

export default function CodeCopyButton({ code }: CodeCopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // 마운트 시 버튼 표시 애니메이션
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500); // 페이지 로드 후 0.5초 후에 버튼 나타남
    return () => clearTimeout(timer);
  }, []);

  // 복사 완료 후 2초 후 상태 초기화
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setIsHovered(false); // 클릭하면 호버 상태도 초기화
    } catch (err) {
      console.error("복사에 실패했습니다:", err);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 25,
          }}
          className="absolute right-3 top-3 z-10"
        >
          <motion.button
            className={`relative rounded-md overflow-hidden ${
              copied
                ? "bg-green-500 text-white"
                : "bg-muted/70 hover:bg-muted text-foreground/70 hover:text-foreground"
            }`}
            onMouseEnter={() => !copied && setIsHovered(true)}
            onMouseLeave={() => !copied && setIsHovered(false)}
            onClick={copyToClipboard}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="코드 복사하기"
            title="코드 복사하기"
          >
            {/* 버튼 내부 컨텐츠의 애니메이션 */}
            <motion.div
              className="px-2.5 py-1.5 flex items-center gap-1.5 text-xs font-medium"
              layout // 자동으로 레이아웃 변화에 애니메이션 적용
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.div
                    key="copied"
                    className="flex items-center gap-1.5"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{
                      duration: 0.3,
                      ease: "easeInOut",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>복사됨</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="copy"
                    className="flex items-center gap-1.5"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{
                      duration: 0.3,
                      ease: "easeInOut",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="9"
                        y="9"
                        width="13"
                        height="13"
                        rx="2"
                        ry="2"
                      ></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    {/* 호버 시 "복사하기" 텍스트 표시 애니메이션 */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.span
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: "auto", opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          transition={{
                            duration: 0.2,
                            ease: "easeInOut",
                          }}
                          style={{ overflow: "hidden", whiteSpace: "nowrap" }}
                        >
                          복사하기
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
