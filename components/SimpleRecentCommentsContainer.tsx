"use client";

import { useState, useEffect } from "react";
import SimpleRecentComments from "./SimpleRecentComments";
import { GiscusComment } from "@/lib/github";
import { PostMeta } from "@/lib/posts";

interface SimpleRecentCommentsContainerProps {
  count?: number;
  allPosts: PostMeta[];
}

export default function SimpleRecentCommentsContainer({
  count = 3,
  allPosts,
}: SimpleRecentCommentsContainerProps) {
  const [comments, setComments] = useState<GiscusComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchComments() {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/comments?count=${count}`);

        if (!response.ok) {
          throw new Error("댓글을 불러오는데 실패했습니다");
        }

        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error("댓글 로딩 오류:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchComments();
  }, [count]);

  return (
    <SimpleRecentComments
      comments={comments}
      isLoading={isLoading}
      allPosts={allPosts}
    />
  );
}
