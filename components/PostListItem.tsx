"use client";

import Image from "next/image";
import Link from "next/link";
import { PostMeta } from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import { useState } from "react";

// 히어로 이미지 전용 컴포넌트 (LCP 최적화)
const HeroImage = ({
  src,
  alt,
  className,
}: {
  src?: string;
  alt: string;
  className?: string;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  if (!src) return null;

  return (
    <div
      className={`relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-muted/50 mb-8 ${className}`}
    >
      {!imageLoaded && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-xl" />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        priority
        placeholder="empty"
        fetchPriority="high"
        sizes="100vw"
        quality={90}
        className={`object-cover transition-opacity duration-300 ${
          imageLoaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setImageLoaded(true)}
      />
    </div>
  );
};

// 이미지 로딩 중 표시할 Skeleton 컴포넌트
const ImageSkeleton = ({ className }: { className?: string }) => (
  <div
    className={`animate-pulse bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 ${className}`}
  />
);

interface PostListItemProps {
  post: PostMeta;
  index?: number; // 포스트 순서 (LCP 최적화를 위해 사용)
}

const PostListItem: React.FC<PostListItemProps> = ({ post, index = 0 }) => {
  // 첫 번째 포스트는 prefetch 활성화 (빠른 페이지 전환)
  const shouldPrefetch = index === 0;
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
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
            {/* 이미지 로딩 중 Skeleton 표시 */}
            {!imageLoaded && !imageError && (
              <ImageSkeleton className="absolute inset-0 rounded-md" />
            )}

            {post.image ? (
              <Image
                src={post.image}
                alt={post.title}
                fill
                priority={shouldPrioritize}
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxtc3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZjNmNGY2Ii8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmM2Y0ZjYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+"
                sizes="(max-width: 640px) 100vw, 128px"
                quality={75}
                className={`object-cover transition-all duration-300 group-hover:scale-105 ${
                  imageLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => setImageLoaded(true)}
                onError={() => setImageError(true)}
                loading={shouldPrioritize ? "eager" : "lazy"}
              />
            ) : (
              !imageError && (
                <Image
                  src={imagePath}
                  alt={post.title}
                  fill
                  priority={shouldPrioritize}
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImEiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxtc3RvcCBvZmZzZXQ9IjAlIiBzdG9wLWNvbG9yPSIjZjNmNGY2Ii8+PHN0b3Agb2Zmc2V0PSI1MCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNmM2Y0ZjYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+"
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 144px, (max-width: 1024px) 168px, 144px"
                  quality={85}
                  className={`object-cover transition-all duration-300 group-hover:scale-105 ${
                    imageLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  loading={shouldPrioritize ? "eager" : "lazy"}
                />
              )
            )}

            {/* 에러 상태일 때 기본 이미지 표시 */}
            {imageError && (
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
