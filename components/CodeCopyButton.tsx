"use client";

import { useState, useEffect } from "react";

interface CodeCopyButtonProps {
  code: string;
}

export default function CodeCopyButton({ code }: CodeCopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setIsHovered(false);
    } catch (err) {
      console.error("복사에 실패했습니다:", err);
    }
  };

  return (
    <div className="absolute right-3 top-3 z-10">
      <button
        className={`relative rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors ${
          copied
            ? "bg-green-500 text-white"
            : "bg-muted/70 hover:bg-muted text-foreground/70 hover:text-foreground"
        }`}
        onMouseEnter={() => !copied && setIsHovered(true)}
        onMouseLeave={() => !copied && setIsHovered(false)}
        onClick={copyToClipboard}
        aria-label="코드 복사하기"
        title="코드 복사하기"
      >
        <span className="inline-flex items-center gap-1.5">
          {copied ? (
            <>
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
            </>
          ) : (
            <>
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
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              {isHovered && <span>복사하기</span>}
            </>
          )}
        </span>
      </button>
    </div>
  );
}
