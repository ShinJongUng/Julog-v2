"use client";

import dynamic from "next/dynamic";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

const SyntaxHighlighter = dynamic(
  () => import("react-syntax-highlighter").then((m) => m.Prism),
  { ssr: false }
);

export default function CodeBlock({
  code,
  language,
}: {
  code: string;
  language?: string;
}) {
  return (
    <SyntaxHighlighter
      language={language}
      style={tomorrow}
      customStyle={{ margin: 0, borderRadius: "0.375rem" }}
      showLineNumbers
      wrapLongLines
    >
      {code}
    </SyntaxHighlighter>
  );
}

