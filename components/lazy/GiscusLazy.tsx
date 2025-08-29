"use client";

import dynamic from "next/dynamic";

const GiscusLazy = dynamic(() => import("../Giscus"), {
  ssr: false,
  loading: () => null,
});

export default GiscusLazy;

