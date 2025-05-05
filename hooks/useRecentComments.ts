"use client";

import { useState, useEffect } from "react";
import { GiscusComment } from "@/lib/github";

export default function useRecentComments(count = 5) {
  const [comments, setComments] = useState<GiscusComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(`/api/comments?count=${count}`);

        if (!response.ok) {
          throw new Error("댓글을 가져오는데 실패했습니다");
        }

        const data = await response.json();
        setComments(data);
      } catch (err) {
        console.error("댓글 로딩 중 오류:", err);
        setError(
          err instanceof Error
            ? err
            : new Error("알 수 없는 오류가 발생했습니다")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [count]);

  return { comments, isLoading, error };
}
