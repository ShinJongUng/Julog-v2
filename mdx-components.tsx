import type { MDXComponents } from "mdx/types";
import Image from "next/image"; // Next.js Image 컴포넌트 사용
// 코드 블록은 빌드 시 정적으로 하이라이트되도록 처리합니다 (rehype-pretty-code 사용).
// 따라서 Lazy 컴포넌트는 제거하고, 인라인 코드는 간단 스타일만 적용합니다.
// Copy 버튼은 필요 시 별도 pre 래퍼에서 확장 가능합니다.
// import CodeCopyButton from "./components/CodeCopyButton";
import { getOptimizedImageUrl } from "./lib/image-utils";
import React from "react";
import YouTubeEmbedLazy from "./components/lazy/YouTubeEmbedLazy";
import PreWithCopy from "./components/PreWithCopy";
import { cn } from "./lib/utils";

// 각 페이지별 이미지 순서를 추적하기 위한 변수
let imageIndex = 0;

// 페이지 변경 시 이미지 인덱스 초기화 함수
export function resetImageIndex() {
  imageIndex = 0;
}

export function getMDXComponents(
  components: MDXComponents,
  opts?: { hasHero?: boolean }
): MDXComponents {
  const hasHero = Boolean(opts?.hasHero);
  return {
    pre: (props: any) => <PreWithCopy {...props} />,
    a: ({ href, children, ...props }) => {
      const hrefStr = typeof href === "string" ? href : "";
      const isExternal = /^https?:\/\//.test(hrefStr);

      // Helper: get plain text from children
      const getText = (node: React.ReactNode): string => {
        if (typeof node === "string") return node;
        if (Array.isArray(node)) return node.map(getText).join("");
        return "";
      };
      const childText = getText(children).trim();

      // Default anchor with safe wrapping so long URLs don’t overflow
      return (
        <a
          href={href}
          className="text-green-700 underline hover:text-green-800 visited:text-green-700 transition-colors dark:text-green-300 dark:hover:text-green-200 break-words max-w-full"
          style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
          {...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          {...props}>
          {children}
        </a>
      );
    },
    h1: ({ children, id }) => (
      <h1
        id={`${children.toString().toLowerCase().replace(/ /g, "-")}-${id}`}
        style={{
          fontSize: "2rem",
          fontWeight: "bold",
          marginTop: "1.5rem",
          marginBottom: "1rem",
        }}>
        {children}
      </h1>
    ),
    h2: ({ children, id }) => (
      <h2
        id={`${children.toString().toLowerCase().replace(/ /g, "-")}-${id}`}
        style={{
          fontSize: "1.5rem",
          fontWeight: "bold",
          marginTop: "1.5rem",
          marginBottom: "1rem",
        }}>
        {children}
      </h2>
    ),
    h3: ({ children, id }) => (
      <h3
        id={`${children.toString().toLowerCase().replace(/ /g, "-")}-${id}`}
        style={{
          fontSize: "1.3rem",
          fontWeight: "bold",
          marginTop: "1.5rem",
          marginBottom: "1rem",
        }}>
        {children}
      </h3>
    ),
    p: ({ children }) => {
      // 단일 링크가 유튜브 URL인 문단은 블록 임베드로 치환하여 p > div 중첩 문제 방지
      const ytRegex =
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/;

      const getText = (node: React.ReactNode): string => {
        if (typeof node === "string") return node;
        if (Array.isArray(node)) return node.map(getText).join("");
        return "";
      };

      const kids = Array.isArray(children)
        ? children.filter(Boolean)
        : [children];
      if (kids.length === 1 && React.isValidElement(kids[0])) {
        const el: any = kids[0];
        const hrefStr: string | undefined = el.props?.href;
        if (hrefStr) {
          const m = hrefStr.match(ytRegex);
          if (m) {
            const videoId = m[1];
            const title = getText(el.props?.children) || undefined;
            return (
              <YouTubeEmbedLazy videoId={videoId} title={title} loadOn="view" />
            );
          }
        }
      }

      return (
        <p style={{ lineHeight: 1.7, marginBottom: "1rem" }}>{children}</p>
      );
    },
    ul: ({ children }) => (
      <ul
        style={{
          listStyle: "disc",
          marginLeft: "1.5rem",
          marginBottom: "1rem",
        }}>
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol
        style={{
          listStyle: "decimal",
          marginLeft: "1.5rem",
          marginBottom: "1rem",
        }}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li style={{ marginBottom: "0.5rem" }} {...props}>
        {children}
      </li>
    ),
    blockquote: ({ children }) => (
      <blockquote
        style={{
          borderLeft: "4px solid #ccc",
          paddingLeft: "1rem",
          fontStyle: "italic",
          color: "#666",
          margin: "1.5rem 0",
        }}>
        {children}
      </blockquote>
    ),
    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
    code: ({ className, children, ...props }: any) => {
      // rehype-pretty-code가 생성한 블록 코드는 data-language 속성이나 language- 클래스를 가지고 있음
      const isCodeBlock =
        (className && /language-\w+/.test(className)) || props["data-language"];

      if (isCodeBlock) {
        // 블록 코드는 rehype-pretty-code의 스타일을 그대로 사용
        return (
          <code
            className={cn(className, "rounded-lg p-3 mb-4 mt-4")}
            {...props}>
            {children}
          </code>
        );
      }

      // 인라인 코드는 노션 스타일 (회색 배경 + 붉은색 텍스트)
      return (
        <span
          className="rounded px-1.5 py-1 mx-1 font-mono text-sm bg-gray-200 dark:bg-gray-700 "
          {...props}>
          {children}
        </span>
      );
    },
    img: ({ src, alt, width, height, title, ...rest }) => {
      if (!src) return null;

      // 이미지 순서 증가 및 LCP 최적화
      const currentImageIndex = imageIndex++;
      const isFirstImage = currentImageIndex === 0;

      // MDX에서 width/height가 문자열로 전달될 수 있으므로 숫자로 변환
      const numWidth = typeof width === "string" ? parseInt(width, 10) : width;
      const numHeight =
        typeof height === "string" ? parseInt(height, 10) : height;

      // 레이아웃 시프트 방지를 위해 기본 값은 제공하되,
      // 고정 비율은 강제하지 않도록 wrapper 에서는 비율을 지정하지 않음
      // 레이아웃의 실제 본문 최대 폭 계산에 맞춤 (Layout: max-w-5xl=1024px, px-4=32px padding,
      // 페이지 grid: lg:grid-cols-4, lg:gap-8=32px, 본문은 lg:col-span-3)
      // 트랙 폭 T = (컨테이너 1024-패딩32 - 3*갭32)/4 = (992 - 96)/4 = 224
      // 본문 폭 = 3*T + 2*갭 = 3*224 + 64 = 736px
      const ARTICLE_MAX_W = 736;
      const validWidth =
        typeof numWidth === "number" && numWidth > 0 ? numWidth : ARTICLE_MAX_W;
      const validHeight =
        typeof numHeight === "number" && numHeight > 0 ? numHeight : 600;

      // 이미지 최적화 - API 라우트를 Next.js Image 최적화와 함께 사용
      const optimizedSrc = getOptimizedImageUrl(src);

      const caption =
        typeof title === "string" && title.trim().length > 0
          ? title
          : undefined;

      return (
        <span className="my-6 block w-full">
          <span
            className="relative block w-full max-w-full"
            style={{
              // 고정 비율을 제거하고, 필요 시 MDX width를 최대 너비로만 존중
              maxWidth:
                typeof numWidth === "number" && numWidth > 0
                  ? `${numWidth}px`
                  : undefined,
            }}>
            <Image
              src={optimizedSrc}
              alt={alt || "이미지"}
              width={validWidth}
              height={validHeight}
              priority={isFirstImage}
              fetchPriority={isFirstImage ? "high" : undefined}
              loading={isFirstImage ? "eager" : "lazy"}
              quality={75}
              sizes={`(min-width: 1024px) ${ARTICLE_MAX_W}px, calc(100vw - 32px)`}
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "0.5rem",
              }}
              {...rest}
            />
          </span>
          {caption && (
            <span className="mt-2 block text-sm text-muted-foreground text-center">
              {caption}
            </span>
          )}
        </span>
      );
    },

    tr: ({ children }) => (
      <tr className="hover:bg-green-50 dark:hover:bg-green-900/20">
        {children}
      </tr>
    ),
    th: ({ children }) => (
      <th className="px-4 py-2 border text-left font-semibold bg-green-800/80 text-white">
        {children}
      </th>
    ),
    td: ({ children }) => <td className="px-4 py-2 border">{children}</td>,
    table: ({ children }) => (
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse border border-gray-300">
          {children}
        </table>
      </div>
    ),
    ...components,
  };
}
