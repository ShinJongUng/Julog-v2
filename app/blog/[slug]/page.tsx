import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPostsMeta, getPostBySlug } from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import { HeroImage } from "@/components/PostListItem";
import {
  generateCompleteMetadata,
  generateArticleStructuredData,
  generateBreadcrumbStructuredData,
  generateFAQStructuredData,
} from "@/lib/seo-utils";
import type { Metadata } from "next";
import TableOfContents from "@/components/TableOfContents";
import Link from "next/link";
import FloatingButtons from "@/components/FloatingButtons";
import Giscus from "@/components/Giscus";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// ISR 설정 - 5분마다 재생성 (더 빠른 콘텐츠 업데이트와 LCP 최적화)
export const revalidate = 300;

export async function generateStaticParams() {
  try {
    const posts = await getAllPostsMeta();
    // 최대 100개의 최근 포스트만 정적 생성하여 빌드 시간 단축
    const recentPosts = posts.slice(0, 100);
    return recentPosts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error("Static params generation error:", error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const postData = await getPostBySlug(resolvedParams.slug);

  if (!postData) {
    return {
      title: "Post Not Found",
    };
  }

  const { meta } = postData;
  // 고도화된 SEO 메타데이터 생성
  const metadata = generateCompleteMetadata(meta);
  return {
    ...metadata,
    robots: {
      index: metadata.robots.index,
      follow: metadata.robots.follow,
      googleBot: {
        index: metadata.robots.googleBot.index,
        follow: metadata.robots.googleBot.follow,
        "max-video-preview": metadata.robots.googleBot["max-video-preview"],
        "max-image-preview": "large",
        "max-snippet": metadata.robots.googleBot["max-snippet"],
      },
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const resolvedParams = await params;
  const postData = await getPostBySlug(resolvedParams.slug);

  if (!postData) {
    notFound();
  }

  const { meta, content } = postData;

  // 각 포스트 페이지마다 이미지 인덱스 초기화 (LCP 최적화를 위해)
  const { getMDXComponents, resetImageIndex } = await import(
    "@/mdx-components"
  );
  resetImageIndex();
  const components = getMDXComponents({}, { hasHero: Boolean(meta.heroImage || meta.image) });

  // 구조화된 데이터 생성
  const articleStructuredData = generateArticleStructuredData(meta, content);
  const breadcrumbStructuredData = generateBreadcrumbStructuredData(meta);
  const faqStructuredData = generateFAQStructuredData(content);

  return (
    <>
      {/* 구조화된 데이터 삽입 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbStructuredData),
        }}
      />
      {faqStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqStructuredData),
          }}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 py-6 md:py-8">
        <article className="prose dark:prose-invert lg:col-span-3 max-w-none">
          <header className="mb-6 md:mb-8 border-b pb-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {meta.title}
            </h1>

            {meta.tags && Array.isArray(meta.tags) && meta.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 not-prose mt-2">
                {meta.tags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/tag/${encodeURIComponent(tag.toLowerCase())}`}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              {formatDate(meta.date)}
            </p>
          </header>

          {/* 히어로 이미지 (LCP 최적화) */}
          <HeroImage src={meta.heroImage || meta.image} alt={meta.title} />

          <MDXRemote
            source={content}
            components={components}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [rehypeSlug],
              },
            }}
          />

          <footer className="mt-8 md:mt-12 border-t pt-6">
            {/* 댓글 섹션은 여기 있지만 화면에 직접 표시되지 않고 버튼을 통해 이동함 */}
            <div id="comments" className="mt-8 scroll-mt-24">
              <Giscus />
            </div>
          </footer>
        </article>

        {/* 우측 목차 영역 */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <h4 className="text-sm font-semibold mb-4">목차</h4>
            <TableOfContents />
          </div>
        </aside>
      </div>

      {/* 플로팅 버튼 추가 */}
      <FloatingButtons commentSectionId="comments" />
    </>
  );
}
