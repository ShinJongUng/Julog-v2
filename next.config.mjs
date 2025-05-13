import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import pkg from "@next/mdx";

const { createMDX } = pkg;

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    mdxRs: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeSlug],
    },
  },
};

export default nextConfig;
