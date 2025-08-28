import { MetadataRoute } from "next";
import { getAllPostsMeta, getAllUniqueTags } from "@/lib/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://blog.jongung.com";

  // 블로그 포스트 목록을 가져옵니다 (async/await 추가)
  const posts = await getAllPostsMeta();
  const postUrls = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // 태그 페이지 URL을 생성합니다 (async/await 추가)
  const tags = await getAllUniqueTags();
  const tagUrls = tags.map((tag) => ({
    url: `${baseUrl}/tag/${encodeURIComponent(tag.toLowerCase())}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  // 정적 페이지 URL
  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1.0,
    },
  ];

  return [...staticUrls, ...postUrls, ...tagUrls];
}
