import PostListItem from "@/components/PostListItem";
import { getAllPostsMeta, getAllUniqueTags } from "@/lib/posts"; // getAllUniqueTags 추가
import Link from "next/link";
import SimpleRecentCommentsContainer from "@/components/SimpleRecentCommentsContainer";

export default async function HomePage() {
  const posts = getAllPostsMeta();
  const allTags = getAllUniqueTags(); // 모든 태그 가져오기

  return (
    <div className="py-6 md:py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        <div className="lg:col-span-2">
          {posts.length === 0 ? (
            <p className="text-muted-foreground">작성된 글이 없습니다.</p>
          ) : (
            <div className="flex flex-col space-y-6 md:space-y-8">
              {posts.map((post) => (
                <PostListItem key={post.slug} post={post} />
              ))}
            </div>
          )}
        </div>

        {/* 오른쪽 컬럼 (사이드바) */}
        <aside className="lg:col-span-1 space-y-6 md:space-y-8 mt-8 lg:mt-0 lg:border-l lg:pl-6">
          <section>
            <h3 className="text-lg font-semibold mb-3 border-b pb-2 flex items-center">
              최근 댓글
            </h3>
            <div className="border rounded-lg p-2 shadow-sm">
              <SimpleRecentCommentsContainer count={3} />
            </div>
          </section>

          <div className="h-px bg-gradient-to-r from-transparent via-green-100 dark:via-green-900 to-transparent my-8"></div>

          <section>
            <h3 className="text-lg font-semibold mb-3 border-b pb-2">
              모든 태그
            </h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tag/${encodeURIComponent(tag.toLowerCase())}`}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-muted hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
