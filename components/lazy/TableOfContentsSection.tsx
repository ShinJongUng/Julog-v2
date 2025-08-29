"use client";

import { Suspense } from "react";
import TableOfContentsLazy from "./TableOfContentsLazy";

export default function TableOfContentsSection() {
  return (
    <Suspense fallback={null}>
      <div className="sticky top-20">
        <TableOfContentsLazy />
      </div>
    </Suspense>
  );
}
