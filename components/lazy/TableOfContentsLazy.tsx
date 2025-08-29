"use client";

import dynamic from "next/dynamic";

const TableOfContentsLazy = dynamic(() => import("../TableOfContents"), {
  ssr: false,
  loading: () => null,
});

export default TableOfContentsLazy;

