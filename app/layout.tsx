import type { Metadata } from "next";
import "./globals.css";
import Layout from "@/components/Layout";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/ThemeProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";

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
/* Define font vars early to prevent FOIT/FOUT */
:root{--font-sans:"NanumSquareRound","Apple SD Gothic Neo","Noto Sans KR","Apple Color Emoji","Segoe UI Emoji",system-ui,sans-serif;--font-title:"NanumSquare","Apple SD Gothic Neo","Noto Sans KR",system-ui,sans-serif}
body{margin:0;font-family:var(--font-sans),system-ui,sans-serif;line-height:inherit;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
`,
          }}
        />
        {/* Webfont CSS (CDN) */}
        {/* NanumSquare (titles) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/moonspam/NanumSquare@2.0/nanumsquare.css"
        />
        {/* NanumSquare Round (body) */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/@kfonts/nanum-square-round@latest/index.css"
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
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
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
