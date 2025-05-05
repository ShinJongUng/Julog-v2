import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  reactStrictMode: true,
  experimental: {
    mdxRs: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        // rehype-pretty-code 관련 설정 완전 제거
      ],
    },
  },
};

export default nextConfig;
