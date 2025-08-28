import type { Metadata } from "next";
import localFont from "next/font/local";
import "./critical-clean.css";
import "./globals.css";
import Layout from "@/components/Layout";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

const hakgyoansim_allimjang = localFont({
  src: [
    {
      path: "../public/fonts/Hakgyoansim-Allimjang-R.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Hakgyoansim-Allimjang-B.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-title",
  display: "swap",
  preload: true,
});

const pretendard = localFont({
  src: [
    {
      path: "../public/fonts/Pretendard-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Pretendard-Medium.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
  preload: true,
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "sans-serif",
  ],
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
        <link
          rel="preconnect"
          href="https://avatars.githubusercontent.com"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          pretendard.variable,
          hakgyoansim_allimjang.variable
        )}
      >
        <Analytics />
        <SpeedInsights />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Layout>{children}</Layout>
        </ThemeProvider>
      </body>
    </html>
  );
}
