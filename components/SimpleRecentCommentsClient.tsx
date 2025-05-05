"use client";

import useRecentComments from "@/hooks/useRecentComments";
import SimpleRecentComments from "./SimpleRecentComments";

interface SimpleRecentCommentsClientProps {
  count?: number;
}

export default function SimpleRecentCommentsClient({
  count = 3,
}: SimpleRecentCommentsClientProps) {
  const { comments, isLoading, error } = useRecentComments(count);

  if (error) {
    return (
      <div className="bg-muted/50 p-3 rounded-md text-sm text-red-500">
        댓글을 불러오는 중 오류가 발생했습니다.
      </div>
    );
  }

  return <SimpleRecentComments comments={comments} isLoading={isLoading} />;
}
