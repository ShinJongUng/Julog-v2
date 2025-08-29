import Image from "next/image";
import Link from "next/link";
import { PostMeta } from "@/lib/posts";
import { formatDate } from "@/lib/utils";

// 히어로 이미지 전용 컴포넌트 (LCP 최적화)
const HeroImage = ({ src, alt, className }: { src?: string; alt: string; className?: string }) => {
  if (!src) return null;
  return (
    <div className={`relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted/50 mb-8 ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority
        placeholder="empty"
        fetchPriority="high"
        sizes="100vw"
        quality={90}
        className="object-cover"
      />
    </div>
  );
};

// Skeleton 제거하여 클라이언트 JS 의존도 축소

interface PostListItemProps {
  post: PostMeta;
  index?: number; // 포스트 순서 (LCP 최적화를 위해 사용)
}

const PostListItem: React.FC<PostListItemProps> = ({ post, index = 0 }) => {
  // 첫 번째 포스트는 prefetch 활성화 (빠른 페이지 전환)
  const shouldPrefetch = index === 0;
  const imageError = false;
  const imagePath = `/${post.slug}/main.png`;

  // LCP 최적화: 첫 번째 3개의 포스트만 priority 적용
  const shouldPrioritize = index < 3;

  return (
    <div className="block border-b pb-8">
      <Link
        href={`/blog/${post.slug}`}
        className="group"
        prefetch={shouldPrefetch}
      >
        <div className="flex flex-col-reverse sm:flex-row sm:items-start sm:gap-6">
          <div className="flex-1 mt-4 sm:mt-0 sm:mb-0 flex flex-col">
            <h2 className="text-xl font-semibold mb-1 group-hover:text-green-600 dark:group-hover:text-green-500 transition-colors duration-300">
              {post.title}
            </h2>
            <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
              {post.description}
            </p>

            {post.tags && Array.isArray(post.tags) && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-muted hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    {tag}
                  </span>
                ))}
                {post.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{post.tags.length - 3}개
                  </span>
                )}
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-4">
              {formatDate(post.date)} · {post.author}
            </p>
          </div>
          <div className="relative aspect-[4/3] max-w-36 w-full overflow-hidden rounded-md bg-muted/50">

            {post.image ? (
              <Image
                src={post.image}
                alt={post.title}
                fill
                priority={shouldPrioritize}
                placeholder="empty"
                sizes="(max-width: 640px) 100vw, 128px"
                quality={75}
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                loading={shouldPrioritize ? "eager" : "lazy"}
              />
            ) : (
              !imageError && (
                <Image
                  src={imagePath}
                  alt={post.title}
                  fill
                  priority={shouldPrioritize}
                  placeholder="empty"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 144px, (max-width: 1024px) 168px, 144px"
                  quality={85}
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  loading={shouldPrioritize ? "eager" : "lazy"}
                />
              )
            )}

            {/* 에러 상태일 때 기본 이미지 표시 */}
            {false && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-md">
                <div className="text-xs text-muted-foreground">
                  이미지를 불러올 수 없습니다
                </div>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export { HeroImage };
export default PostListItem;
