import type { MDXComponents } from "mdx/types";
import Image from "next/image"; // Next.js Image 컴포넌트 사용
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import CodeCopyButton from "./components/CodeCopyButton";
import { getOptimizedImageUrl } from "./lib/image-utils";
import React from "react";

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
      // YouTube embed for any YouTube link (regardless of anchor text)
      const ytMatch = hrefStr.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/
      );
      if (ytMatch) {
        const videoId = ytMatch[1];
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        return (
          <div className="my-6 w-full max-w-full not-prose">
            <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
              <iframe
                src={embedUrl}
                className="absolute inset-0 h-full w-full rounded-xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                title="YouTube video"
              />
            </div>
          </div>
        );
      }

      // Default anchor with safe wrapping so long URLs don’t overflow
      return (
        <a
          href={href}
          className="text-green-700 underline hover:text-green-800 visited:text-green-700 transition-colors dark:text-green-300 dark:hover:text-green-200 break-words max-w-full"
          style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
          {...(isExternal
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
          {...props}
        >
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
        }}
      >
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
        }}
      >
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
        }}
      >
        {children}
      </h3>
    ),
    p: ({ children }) => (
      <p style={{ lineHeight: 1.7, marginBottom: "1rem" }}>{children}</p>
    ),
    ul: ({ children }) => (
      <ul
        style={{
          listStyle: "disc",
          marginLeft: "1.5rem",
          marginBottom: "1rem",
        }}
      >
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol
        style={{
          listStyle: "decimal",
          marginLeft: "1.5rem",
          marginBottom: "1rem",
        }}
      >
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
        }}
      >
        {children}
      </blockquote>
    ),
    strong: ({ children }) => (
      <strong className="font-bold px-1 py-0.5 bg-green-50 dark:bg-green-900/40 rounded">
        {children}
      </strong>
    ),
    code: ({ className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      const code = String(children).replace(/\n$/, "");

      if (match) {
        const language = match[1];
        return (
          <div className="my-6 rounded-md overflow-hidden relative">
            <CodeCopyButton code={code} />
            <SyntaxHighlighter
              language={language}
              style={tomorrow}
              customStyle={{ margin: 0, borderRadius: "0.375rem" }}
              showLineNumbers
              wrapLongLines
            >
              {code}
            </SyntaxHighlighter>
          </div>
        );
      }

      return (
        <code
          className="rounded px-1.5 py-0.5 font-mono text-sm bg-green-100 dark:bg-green-900/40"
          {...props}
        >
          {children}
        </code>
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

      // 레이아웃 시프트 방지를 위해 더 적절한 기본값 설정
      const validWidth =
        typeof numWidth === "number" && numWidth > 0 ? numWidth : 800;
      const validHeight =
        typeof numHeight === "number" && numHeight > 0
          ? numHeight
          : Math.round(validWidth * 0.6); // 16:10 비율로 기본값 설정

      // 이미지 최적화 - API 라우트를 Next.js Image 최적화와 함께 사용
      const optimizedSrc = getOptimizedImageUrl(src);

      const caption =
        typeof title === "string" && title.trim().length > 0
          ? title
          : undefined;

      return (
        <figure className="my-6 w-full flex flex-col items-center">
          <div
            className="relative w-full max-w-full"
            style={{
              aspectRatio: `${validWidth}/${validHeight}`,
              maxWidth: `${validWidth}px`,
            }}
          >
            <Image
              src={optimizedSrc}
              alt={alt || "이미지"}
              width={validWidth}
              height={validHeight}
              className="rounded-xl object-contain"
              priority={isFirstImage}
              loading={isFirstImage ? "eager" : "lazy"}
              quality={50}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 800px"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
              {...rest}
            />
          </div>
          {caption && (
            <figcaption className="mt-2 text-sm text-muted-foreground text-center">
              {caption}
            </figcaption>
          )}
        </figure>
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
