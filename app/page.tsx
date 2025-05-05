import PostListItem from "@/components/PostListItem";
import { getAllPostsMeta, getAllUniqueTags } from "@/lib/posts"; // getAllUniqueTags 추가
import Link from "next/link";

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
        <aside className="lg:col-span-1 space-y-6 md:space-y-8 mt-8 lg:mt-0">
          <section>
            <h3 className="text-lg font-semibold mb-3 border-b pb-2">
              인기있는 글
            </h3>
            <ul className="space-y-3">
              {/* 실제 데이터 기반으로 인기 글 표시 (예시: 첫 3개 글) */}
              {posts.slice(0, 3).map((post) => (
                <li key={post.slug} className="text-sm">
                  <a href={`/blog/${post.slug}`} className="hover:text-primary">
                    {post.title}
                  </a>
                  {post.author && (
                    <p className="text-xs text-muted-foreground">
                      {post.author}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-3 border-b pb-2">
              최근 댓글
            </h3>
            <div className="space-y-3">
              <div className="bg-muted/50 p-3 rounded-md text-sm">
                <p className="font-medium">qwerty2944</p>
                <p className="text-muted-foreground mt-1">
                  efs에 비해서 어떤 장점이 있는걸까요? 잘보고갑니다!
                </p>
              </div>
              <div className="bg-muted/50 p-3 rounded-md text-sm">
                <p className="font-medium">dev_lover</p>
                <p className="text-muted-foreground mt-1">
                  좋은 글 감사합니다!
                </p>
              </div>
            </div>
          </section>

          {/* 태그 모음 영역 - 사이드바로 이동 */}
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
