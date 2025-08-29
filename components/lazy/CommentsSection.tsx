"use client";

import { Suspense } from "react";
import GiscusLazy from "./GiscusLazy";

export default function CommentsSection() {
  return (
    <Suspense fallback={null}>
      <div>
        <GiscusLazy />
      </div>
    </Suspense>
  );
}
