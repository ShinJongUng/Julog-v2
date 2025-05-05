"use client";

import Image from "next/image";
import Link from "next/link";
import { PostMeta } from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import { useState } from "react";

interface PostListItemProps {
  post: PostMeta;
}

const PostListItem: React.FC<PostListItemProps> = ({ post }) => {
  const [imageError, setImageError] = useState(false);
  const imagePath = `/${post.slug}/main.png`;

  return (
    <div className="block border-b pb-8">
      <Link href={`/blog/${post.slug}`} className="group">
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
          <div className="relative aspect-video w-full sm:w-48 overflow-hidden rounded-md flex-shrink-0 bg-muted/50">
            {post.image ? (
              <Image
                src={post.image}
                alt={post.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 48px, (max-width: 1024px) 56px, 64px"
                className="object-cover transition-transform group-hover:scale-105 duration-300"
                onError={() => setImageError(true)}
              />
            ) : (
              !imageError && (
                <Image
                  src={imagePath}
                  alt={post.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 48px, (max-width: 1024px) 56px, 64px"
                  className="object-cover transition-transform group-hover:scale-105 duration-300"
                  onError={() => setImageError(true)}
                />
              )
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PostListItem;
