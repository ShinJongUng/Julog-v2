// MDX 관련 import 제거 - Notion 기반으로 변경

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx"], // MDX 확장자 제거
  reactStrictMode: true,

  transpilePackages: ["next-mdx-remote"],

  // 모던 브라우저 타겟팅으로 번들 크기 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // 번들 크기 최적화
  experimental: {
    // 자주 쓰는 유틸 패키지 최적화 (하위 경로로 자동 변경)
    optimizePackageImports: ["lucide-react", "date-fns"],
    // Inline critical CSS and defer the rest via Critters
    optimizeCss: true,
    // Inline CSS where possible to avoid extra roundtrips
    inlineCss: true,
    // Create more granular per-route CSS chunks
    cssChunking: "strict",
  },

  // 서버 패키지 설정
  serverExternalPackages: [],
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
  },

  // CSS 최적화 설정

  // 웹팩 최적화
  webpack: (config, { isServer }) => {
    // 코드 스플리팅 최적화
    if (!isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
            priority: 10,
          },
          common: {
            name: "common",
            minChunks: 2,
            chunks: "all",
            priority: 5,
            reuseExistingChunk: true,
          },
        },
      };

      // 미사용 코드 제거 강화
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;

      // Tree shaking 강화
      config.optimization.providedExports = true;
    }

    // 불필요한 모듈 번들링 방지
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push({
        // Analytics 번들 크기 최적화
        "@vercel/analytics": "@vercel/analytics",
        "@vercel/speed-insights": "@vercel/speed-insights",
      });
    }

    return config;
  },

  // 빌드 성능 최적화
  output: "standalone",

  // 캐시 정책 개선을 위한 헤더 설정
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
      // Favicon / Icons 캐시 정책
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // 폰트 파일 캐시 정책
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // 이미지 파일 캐시 정책
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
      // Next Image 최적화 엔드포인트 캐시 정책
      {
        source: "/_next/image",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=600, stale-while-revalidate=86400",
          },
        ],
      },
      // JS/CSS 번들 캐시 정책
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "prod-files-secure.s3.us-west-2.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "secure.notion-static.com",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
      },
    ],
    // LCP 디코딩 지연 최소화를 위해 WebP만 사용
    formats: ["image/webp"],
    // 모바일 우선순위로 불필요한 해상도 제거 및 더 작은 기본 크기
    deviceSizes: [320, 360, 414, 640, 750, 828],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 320],
    // 더 긴 캐시 시간으로 재요청 감소
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // 이미지 압축 최적화 - 더 aggressive한 압축으로 파일 크기 감소
    unoptimized: false, // Next.js 최적화 활성화
  },
  // MDX 설정 제거 - Notion 기반으로 변경
};

export default nextConfig;
