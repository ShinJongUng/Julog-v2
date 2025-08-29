"use client";

import { Suspense } from "react";
import GiscusLazy from "./GiscusLazy";

export default function CommentsSection() {
  return (
    <Suspense fallback={null}>
      <div>
        <h4 className="text-sm font-semibold mb-4">댓글</h4>
        <GiscusLazy />
      </div>
    </Suspense>
  );
}

