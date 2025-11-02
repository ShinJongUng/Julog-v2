import type { Metadata } from "next";
import "./globals.css";
import Layout from "@/components/Layout";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import AnalyticsLazy from "@/components/lazy/AnalyticsLazy";
import localFont from "next/font/local";

// Self-hosted fonts to avoid render-blocking CSS from CDNs
const nanumSquare = localFont({
  src: [
    { path: "./fonts/NanumSquareL.woff2", weight: "300", style: "normal" },
    { path: "./fonts/NanumSquareR.woff2", weight: "400", style: "normal" },
    { path: "./fonts/NanumSquareB.woff2", weight: "700", style: "normal" },
    { path: "./fonts/NanumSquareEB.woff2", weight: "800", style: "normal" },
  ],
  variable: "--font-title",
  display: "swap",
});

const nanumSquareRound = localFont({
  src: [
    { path: "./fonts/NanumSquareRoundL.woff2", weight: "300", style: "normal" },
    { path: "./fonts/NanumSquareRoundR.woff2", weight: "400", style: "normal" },
    { path: "./fonts/NanumSquareRoundB.woff2", weight: "700", style: "normal" },
    {
      path: "./fonts/NanumSquareRoundEB.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://blog.jongung.com"),
  title: {
    default: "JULOG",
    template: "%s | JULOG",
  },
  description: "개발 발자취 남기기",
  keywords: ["기술 블로그", "개발", "프로그래밍", "프론트엔드", "프로덕트"],
  authors: [{ name: "신종웅" }],
  openGraph: {
    title: "Julog",
    description: "개발 발자취 남기기",
    url: "https://blog.jongung.com",
    siteName: "Julog",
    locale: "ko_KR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        {/* Inline tiny critical CSS to avoid extra blocking request */}
        <style
          dangerouslySetInnerHTML={{
            __html: `/* Critical CSS - minimal */
*{box-sizing:border-box}
html{line-height:1.5;-webkit-text-size-adjust:100%}
body{margin:0;font-family:var(--font-sans),system-ui,sans-serif;line-height:inherit;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
`,
          }}
        />
        {/* Preconnects for third-party origins used early */}
        <link
          rel="preconnect"
          href="https://avatars.githubusercontent.com"
          crossOrigin="anonymous"
        />
        <link
          rel="dns-prefetch"
          href="https://prod-files-secure.s3.us-west-2.amazonaws.com"
        />
        <link
          rel="preconnect"
          href="https://prod-files-secure.s3.us-west-2.amazonaws.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://secure.notion-static.com" />
        <link
          rel="preconnect"
          href="https://secure.notion-static.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://giscus.app" />
        <link
          rel="preconnect"
          href="https://giscus.app"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://vitals.vercel-insights.com" />
        <link
          rel="preconnect"
          href="https://vitals.vercel-insights.com"
          crossOrigin="anonymous"
        />
        {/* Google Search Console */}
        <meta
          name="google-site-verification"
          content="b0kt3EponSzvvcSyhrDBcH18r-6z5_V2j6RYmHwGCu4"
        />
        {/* Naver Search Advisor */}
        <meta
          name="naver-site-verification"
          content="e8c1b1eec11892d4c47bfe48b7bd5d04afe84c68"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: light)"
          content="#ffffff"
        />
        <meta
          name="theme-color"
          media="(prefers-color-scheme: dark)"
          content="#0B1220"
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          nanumSquare.variable,
          nanumSquareRound.variable
        )}>
        {/* Web Analytics는 Lazy 로딩, Speed Insights는 기존 유지 */}
        <AnalyticsLazy />
        <SpeedInsights />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange>
          <Layout>{children}</Layout>
        </ThemeProvider>
      </body>
    </html>
  );
}
