import { fetchRecentComments } from "@/lib/github";
import SimpleRecentComments from "./SimpleRecentComments";

interface SimpleRecentCommentsContainerProps {
  count?: number;
}

export default async function SimpleRecentCommentsContainer({
  count = 3,
}: SimpleRecentCommentsContainerProps) {
  const comments = await fetchRecentComments(count);

  return <SimpleRecentComments comments={comments} />;
}
