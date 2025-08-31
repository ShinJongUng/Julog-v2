"use client";

import React from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

export default function DeferredVercel() {
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (document.readyState === "complete") {
      setReady(true);
      return;
    }
    const onLoad = () => setReady(true);
    window.addEventListener("load", onLoad, { once: true });
    return () => window.removeEventListener("load", onLoad);
  }, []);

  if (!ready) return null;
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}

