import type { MDXComponents } from "mdx/types";
import Image from "next/image"; // Next.js Image 컴포넌트 사용
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import CodeCopyButton from "./components/CodeCopyButton";
import React from "react";

export function getMDXComponents(components: MDXComponents): MDXComponents {
  return {
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
            {/* 복사 버튼만 클라이언트 컴포넌트로 분리 */}
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
    img: ({ src, alt, width, height, ...rest }) => {
      // MDX에서 width/height가 문자열로 전달될 수 있으므로 숫자로 변환합니다.
      const numWidth = typeof width === "string" ? parseInt(width, 10) : width;
      const numHeight =
        typeof height === "string" ? parseInt(height, 10) : height;

      // 유효성 검사 또는 기본값 설정
      // MDX 파일에 width/height 속성이 없는 경우를 대비한 기본값
      const validWidth =
        typeof numWidth === "number" && numWidth > 0 ? numWidth : 700;
      const validHeight =
        typeof numHeight === "number" && numHeight > 0 ? numHeight : 400;

      return (
        <span className="my-6 w-full flex justify-center">
          <Image
            src={src || ""}
            alt={alt || "이미지"}
            width={validWidth}
            height={validHeight}
            className="rounded-xl mx-auto max-w-full w-auto h-auto shadow-md "
            {...rest}
          />
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
    ...components,
  };
}
