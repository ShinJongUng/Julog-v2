"use client";

import { Suspense } from "react";
import TableOfContentsLazy from "./TableOfContentsLazy";

export default function TableOfContentsSection() {
  return (
    <Suspense fallback={null}>
      <div className="sticky top-20">
        <h4 className="text-sm font-semibold mb-4">목차</h4>
        <TableOfContentsLazy />
      </div>
    </Suspense>
  );
}

