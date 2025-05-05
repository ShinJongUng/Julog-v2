import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

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
  },
  experimental: {
    mdxRs: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeSlug],
    },
  },
};

export default nextConfig;
