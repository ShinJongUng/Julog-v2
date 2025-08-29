// MDX 관련 import 제거 - Notion 기반으로 변경

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx"], // MDX 확장자 제거
  reactStrictMode: true,

  // 모던 브라우저 타겟팅으로 번들 크기 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // 번들 크기 최적화
  experimental: {
    optimizePackageImports: ["lucide-react"],
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
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // 이미지 최적화 성능 향상
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  // MDX 설정 제거 - Notion 기반으로 변경
};

export default nextConfig;
