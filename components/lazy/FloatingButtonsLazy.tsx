"use client";

import dynamic from "next/dynamic";

const FloatingButtonsLazy = dynamic(() => import("../FloatingButtons"), {
  ssr: false,
  loading: () => null,
});

export default FloatingButtonsLazy;

