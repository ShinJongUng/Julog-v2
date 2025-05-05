// GitHub 인증 토큰 및 저장소 정보
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = "ShinJongUng";
const REPO_NAME = "Julog-v2";

// 댓글 타입 정의
export interface GiscusComment {
  id: string;
  url: string;
  author: {
    login: string;
    url: string;
    avatarUrl: string;
  };
  createdAt: string;
  bodyText: string;
  discussionUrl: string;
  discussionTitle: string;
  reactionCount: number;
  path: string; // 댓글이 달린 페이지 경로
}

/** GitHub Discussion 카테고리 정보 */
interface CategoryNode {
  name: string;
}

/** GitHub 사용자 정보 */
interface AuthorNode {
  login: string;
  url: string;
  avatarUrl: string;
}

/** 댓글의 반응 사용자 정보 */
interface UsersNode {
  totalCount: number;
}

/** 댓글의 반응 그룹 정보 */
interface ReactionGroupNode {
  content: string; // 반응 이모지 종류 (e.g., "THUMBS_UP", "HEART")
  users: UsersNode;
}

/** GitHub Discussion 댓글 정보 */
interface CommentNode {
  id: string;
  url: string;
  author: AuthorNode | null; // 작성자가 삭제되었을 수 있음
  createdAt: string;
  bodyText: string;
  reactionGroups: ReactionGroupNode[];
}

/** GitHub Discussion 정보 */
interface DiscussionNode {
  title: string;
  url: string;
  category: CategoryNode;
  comments: {
    nodes: CommentNode[];
  };
}

/** GitHub GraphQL API 응답 데이터 구조 */
interface GitHubApiResponse {
  data: {
    repository: {
      discussions: {
        nodes: DiscussionNode[];
      };
    };
  };
}

/**
 * GitHub GraphQL API를 사용하여 giscus 댓글(Discussions)을 가져오는 함수
 */
export async function fetchRecentComments(count = 5): Promise<GiscusComment[]> {
  if (!GITHUB_TOKEN) {
    console.warn("GitHub 토큰이 설정되지 않았습니다.");
    return [];
  }

  try {
    // GraphQL 쿼리: 저장소의 최근 Discussions 및 댓글 가져오기
    const query = `
      query GetRecentComments {
        repository(owner: "${REPO_OWNER}", name: "${REPO_NAME}") {
          discussions(first: 20, orderBy: {field: UPDATED_AT, direction: DESC}) {
            nodes {
              title
              url
              category {
                name
              }
              comments(first: 10) {
                nodes {
                  id
                  url
                  author {
                    login
                    url
                    avatarUrl
                  }
                  createdAt
                  bodyText
                  reactionGroups {
                    content
                    users {
                      totalCount
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`GitHub API 호출 실패: ${response.statusText}`);
    }

    const data: GitHubApiResponse = await response.json();
    const comments: GiscusComment[] = [];

    data.data.repository.discussions.nodes.forEach(
      (discussion: DiscussionNode) => {
        // giscus 경로 매핑: discussion 제목에서 경로 추출
        let path = "";
        if (discussion.title.startsWith("/")) {
          path = discussion.title;
        } else if (discussion.title.includes("pathname:")) {
          path = discussion.title.split("pathname:")[1].trim();
        }

        discussion.comments.nodes.forEach((comment: CommentNode) => {
          // 각 댓글의 반응 수 계산
          const reactionCount = comment.reactionGroups.reduce(
            (sum: number, group: ReactionGroupNode) =>
              sum + group.users.totalCount,
            0
          );

          comments.push({
            id: comment.id,
            url: comment.url,
            author: {
              login: comment.author?.login || "삭제된 사용자",
              url: comment.author?.url || "#",
              avatarUrl:
                comment.author?.avatarUrl || "https://github.com/ghost.png",
            },
            createdAt: comment.createdAt,
            bodyText: comment.bodyText,
            discussionUrl: discussion.url,
            discussionTitle: discussion.title,
            reactionCount,
            path,
          });
        });
      }
    );

    // 생성일 기준 정렬 및 요청된 개수만큼 반환
    return comments
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, count);
  } catch (error) {
    console.error("최근 댓글을 가져오는 중 오류 발생:", error);
    return [];
  }
}
