import { getPostsByTag, getAllUniqueTags } from "@/lib/posts";
import PostListItem from "@/components/PostListItem";
import type { Metadata } from "next";
import Link from "next/link";

interface TagPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const tags = getAllUniqueTags();
  return tags.map((tag) => ({
    slug: tag.toLowerCase(),
  }));
}

export async function generateMetadata({
  params,
}: TagPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const decodedTag = decodeURIComponent(resolvedParams.slug);

  return {
    title: `${decodedTag} 관련 글`,
    description: `${decodedTag} 태그가 포함된 모든 글`,
    openGraph: {
      title: `${decodedTag} 관련 글 - julog`,
      description: `${decodedTag} 태그가 포함된 모든 글`,
      type: "website",
    },
  };
}

export default async function TagPage({ params }: TagPageProps) {
  const resolvedParams = await params;
  const decodedTag = decodeURIComponent(resolvedParams.slug);

  // 해당 태그를 가진 게시물 가져오기
  const posts = getPostsByTag(decodedTag);

  // 다른 인기 태그 가져오기 (최대 10개)
  const allTags = getAllUniqueTags();
  const otherTags = allTags
    .filter((tag) => tag.toLowerCase() !== decodedTag.toLowerCase())
    .slice(0, 10);

  return (
    <div className="py-6 md:py-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="text-green-600 dark:text-green-400">
            #{decodedTag}
          </span>{" "}
          태그 글
        </h1>
        <p className="text-muted-foreground">
          총 {posts.length}개의 글이 있습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2">
          {posts.length === 0 ? (
            <div className="text-center py-8 md:py-12">
              <p className="text-muted-foreground mb-4">
                이 태그에 해당하는 글이 없습니다.
              </p>
              <Link
                href="/"
                className="inline-flex px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                홈으로 돌아가기
              </Link>
            </div>
          ) : (
            <div className="flex flex-col space-y-6 md:space-y-8">
              {posts.map((post) => (
                <PostListItem key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* 오른쪽 사이드바 */}
        <aside className="lg:col-span-1 space-y-6 md:space-y-8 mt-8 lg:mt-0">
          <section>
            <h3 className="text-lg font-semibold mb-3 border-b pb-2">
              다른 태그
            </h3>
            <div className="flex flex-wrap gap-2">
              {otherTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tag/${encodeURIComponent(tag.toLowerCase())}`}
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-sm bg-muted hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 border-b pb-2">
              전체 글 보기
            </h3>
            <Link
              href="/"
              className="inline-flex items-center text-sm hover:text-primary"
            >
              모든 게시물 보기 →
            </Link>
          </section>
        </aside>
      </div>
    </div>
  );
}
