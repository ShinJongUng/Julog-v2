import { GiscusComment } from "@/lib/github";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { PostMeta } from "@/lib/posts";
import Image from "next/image";

interface SimpleRecentCommentsProps {
  comments: GiscusComment[];
  isLoading?: boolean;
  allPosts: PostMeta[];
}

export default function SimpleRecentComments({
  comments,
  isLoading = false,
  allPosts,
}: SimpleRecentCommentsProps) {
  const slugToTitleMap = new Map(
    allPosts.map((post) => [post.slug, post.title])
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, index) => (
          <div
            key={index}
            className="p-3 rounded-md text-sm animate-pulse border-b last:border-b-0"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
            <div className="mt-2 h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="mt-2 h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <div className="p-3 text-sm ">
        <p className="text-muted-foreground">
          아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
        </p>
      </div>
    );
  }

  const displayComments = comments.slice(0, 3);

  return (
    <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-800">
      {displayComments.map((comment) => {
        const summary =
          comment.bodyText.length > 50
            ? `${comment.bodyText.substring(0, 50)}...`
            : comment.bodyText;

        const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
          addSuffix: true,
          locale: ko,
        });

        let slug = "";
        let postTitle = "";
        let postPath = "";

        // giscus 경로에서 slug 및 블로그 포스트 경로 추출
        if (comment.path) {
          const pathParts = comment.path.split("/");
          if (pathParts.length > 1) {
            slug = pathParts[pathParts.length - 1];

            if (comment.path.includes("/blog/")) {
              postPath = comment.path;
            } else {
              postPath = `/blog/${slug}`;
            }
          }
        } else if (comment.discussionTitle) {
          const titleParts = comment.discussionTitle.split("/");
          if (titleParts.length > 1) {
            slug = titleParts[titleParts.length - 1];
            postPath = `/blog/${slug}`;
          }
        }

        // 실제 블로그 제목 가져오기
        if (slug && slugToTitleMap.has(slug)) {
          postTitle = slugToTitleMap.get(slug) || "";
        } else {
          postTitle = "알 수 없는 글";

          let processedTitle = comment.discussionTitle;
          if (processedTitle.startsWith("/")) {
            processedTitle = processedTitle.split("/").pop() || processedTitle;
          } else if (processedTitle.includes("pathname:")) {
            processedTitle = processedTitle.split("pathname:")[1].trim();
            processedTitle = processedTitle.split("/").pop() || processedTitle;
          }

          postTitle = processedTitle
            .replace(/-/g, " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
        }

        return (
          <Link
            key={comment.id}
            href={postPath || comment.url}
            target={!postPath ? "_blank" : undefined}
            rel={!postPath ? "noopener noreferrer" : undefined}
            className="group block p-3 hover:bg-green-50 dark:hover:bg-green-950 transition-colors rounded-md"
          >
            <div className="flex items-start gap-2">
              <Image
                width={28}
                height={28}
                src={comment.author.avatarUrl}
                alt={`${comment.author.login}의 아바타`}
                className="w-7 h-7 rounded-full mt-1 ring-1 ring-gray-200 dark:ring-gray-700"
              />

              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-sm">{comment.author.login}</p>
                  <span className="text-xs text-muted-foreground">
                    {timeAgo}
                  </span>
                </div>

                <p className="mt-1 text-sm">{summary}</p>

                <div className="mt-2 text-xs text-muted-foreground font-medium">
                  <span className="group-hover:text-green-600 transition-colors inline-flex items-center">
                    {postTitle}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
