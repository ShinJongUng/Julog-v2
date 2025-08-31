"use client";

import dynamic from "next/dynamic";

// Web Analytics는 클라이언트에서 지연 로드하여 번들/실행 비용을 낮춥니다.
const Analytics = dynamic(
  () => import("@vercel/analytics/react").then((m) => m.Analytics),
  { ssr: false }
);

export default function AnalyticsLazy() {
  return <Analytics />;
}

