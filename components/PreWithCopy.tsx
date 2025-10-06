"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import CodeCopyButton from "./CodeCopyButton";
import { cn } from "@/lib/utils";

type PreWithCopyProps = React.HTMLAttributes<HTMLPreElement> & {
  children?: React.ReactNode;
};

export default function PreWithCopy({
  className,
  children,
  ...rest
}: PreWithCopyProps) {
  const preRef = useRef<HTMLPreElement | null>(null);
  const [codeText, setCodeText] = useState<string>("");

  useEffect(() => {
    const codeEl = preRef.current?.querySelector("code");
    if (codeEl) {
      // Use textContent to preserve newlines and spacing
      const text = (codeEl as HTMLElement).textContent || "";
      setCodeText(text);
    }
  }, []);

  return (
    <pre
      ref={preRef}
      className={cn("relative rounded-lg", className)}
      {...rest}>
      {/* Copy button sits at top-right inside pre */}
      <CodeCopyButton code={codeText} />
      {children}
    </pre>
  );
}
