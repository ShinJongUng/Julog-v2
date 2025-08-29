import { PostMeta } from "./posts";

/**
 * 동적 OG 이미지 URL 생성
 */
export function generateOGImageUrl(post: PostMeta): string {
  const params = new URLSearchParams({
    title: post.title,
    description: post.description,
    author: post.author,
    date: post.date,
    tags: post.tags?.slice(0, 3).join(", ") || "",
  });

  return `/api/og?${params.toString()}`;
}

/**
 * 구조화된 데이터 (JSON-LD) 생성
 */
export function generateArticleStructuredData(post: PostMeta, content: string) {
  const wordCount = content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200); // 분당 200단어 기준

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    image: post.image || generateOGImageUrl(post),
    author: {
      "@type": "Person",
      name: post.author,
      url: "https://blog.jongung.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Julog",
      logo: {
        "@type": "ImageObject",
        url: "https://blog.jongung.com/images/logo.webp",
      },
    },
    datePublished: new Date(post.date).toISOString(),
    dateModified: new Date(post.date).toISOString(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://blog.jongung.com/blog/${post.slug}`,
    },
    wordCount: wordCount,
    timeRequired: `PT${readingTime}M`,
    keywords: post.tags?.join(", ") || "",
    articleSection: post.tags?.[0] || "기술",
    inLanguage: "ko-KR",
  };
}

/**
 * 브레드크럼 구조화된 데이터 생성
 */
export function generateBreadcrumbStructuredData(post: PostMeta) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "홈",
        item: "https://blog.jongung.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "블로그",
        item: "https://blog.jongung.com/blog",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: post.title,
        item: `https://blog.jongung.com/blog/${post.slug}`,
      },
    ],
  };
}

/**
 * FAQ 구조화된 데이터 생성 (콘텐츠에서 H2 제목을 질문으로 추출)
 */
export function generateFAQStructuredData(content: string) {
  const h2Matches = content.match(/## (.*?)(?=\n)/g);

  if (!h2Matches || h2Matches.length < 2) {
    return null;
  }

  const faqs = h2Matches.slice(0, 5).map((h2, index) => {
    const question = h2.replace("## ", "");
    const nextH2Index = content.indexOf(h2Matches[index + 1] || "---END---");
    const currentH2Index = content.indexOf(h2);
    const answer = content
      .substring(currentH2Index + h2.length, nextH2Index)
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("#"))
      .slice(0, 3)
      .join(" ")
      .trim()
      .substring(0, 300);

    return {
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    };
  });

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs,
  };
}

/**
 * 완전한 메타데이터 생성
 */
export function generateCompleteMetadata(post: PostMeta) {
  const ogImageUrl = post.image
    ? post.image.startsWith("http")
      ? post.image
      : `https://blog.jongung.com${post.image}`
    : `https://blog.jongung.com${generateOGImageUrl(post)}`;

  return {
    title: `${post.title}`,
    description: post.description,
    keywords: post.tags?.join(", ") || "",
    authors: [{ name: post.author, url: "https://blog.jongung.com" }],
    creator: post.author,
    publisher: "신종웅",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `https://blog.jongung.com/blog/${post.slug}`,
      siteName: "Julog",
      locale: "ko_KR",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      publishedTime: new Date(post.date).toISOString(),
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogImageUrl],
      creator: "@yourhandle", // 실제 트위터 핸들로 변경
    },
    alternates: {
      canonical: `https://blog.jongung.com/blog/${post.slug}`,
    },
    other: {
      "article:author": post.author,
      "article:published_time": new Date(post.date).toISOString(),
      "article:tag": post.tags?.join(", ") || "",
    },
  };
}
