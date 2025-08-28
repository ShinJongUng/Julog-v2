import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { PostMeta } from "./posts";
import type { PageObjectResponse } from "@notionhq/client/build/src/api-endpoints";
import type { NotionPageProperties } from "./notion-types";
import { unstable_cache } from "next/cache";

// Notion 클라이언트 초기화
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const n2m = new NotionToMarkdown({ notionClient: notion });

// Notion 데이터베이스 ID (환경변수에서 가져옴)
const DATABASE_ID = process.env.NOTION_DATABASE_ID || "";

// Notion 페이지 속성 타입 정의 - PageObjectResponse 사용
type NotionPage = PageObjectResponse;

/**
 * Notion 페이지 데이터를 PostMeta 형식으로 변환
 */
function notionPageToPostMeta(page: NotionPage): PostMeta | null {
  try {
    const properties = page.properties as unknown as NotionPageProperties;

    // 필수 필드 검증
    const title = properties.이름?.title?.[0]?.plain_text;
    const description = properties.설명?.rich_text?.[0]?.plain_text;
    const date = properties.작성일?.date?.start;
    const status = properties.상태?.status?.name;
    const isPublished = status === "글 작성 완료";

    if (!title || !description || !date) {
      console.warn(`Notion 페이지 ${page.id}: 필수 필드가 누락되었습니다.`);
      return null;
    }

    // 슬러그 생성 (명시적으로 설정되어 있으면 사용, 아니면 제목에서 생성)
    let slug = properties.슬러그?.rich_text?.[0]?.plain_text;
    if (!slug) {
      slug = title
        .toLowerCase()
        .replace(/[^가-힣a-z0-9\s-]/g, "") // 한글, 영문, 숫자, 공백, 하이픈만 허용
        .replace(/\s+/g, "-") // 공백을 하이픈으로
        .replace(/-+/g, "-") // 연속 하이픈 제거
        .trim();
    }

    // 작성자
    const author = properties.작성자?.rich_text?.[0]?.plain_text || "신종웅";

    // 태그
    const tags = properties.태그?.multi_select?.map((tag) => tag.name) || [];

    // 이미지 URL 추출
    let image: string | undefined;
    const imageFiles = properties.이미지?.files;
    if (imageFiles && imageFiles.length > 0) {
      const firstImage = imageFiles[0];
      image = firstImage.file?.url || firstImage.external?.url;
    }

    return {
      slug,
      title,
      date,
      description,
      author,
      image,
      tags,
      isPublished,
    };
  } catch (error) {
    console.error(`Notion 페이지 변환 오류 (${page.id}):`, error);
    return null;
  }
}

// 캐시된 Notion 데이터베이스 조회 함수
const _getAllPostsMeta = async (): Promise<PostMeta[]> => {
  try {
    if (!DATABASE_ID) {
      console.error("NOTION_DATABASE_ID 환경변수가 설정되지 않았습니다.");
      return [];
    }

    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        property: "상태",
        status: {
          equals: "글 작성 완료",
        },
      },
      sorts: [
        {
          property: "작성일",
          direction: "descending",
        },
      ],
    });

    const posts = response.results
      .filter((result): result is PageObjectResponse => "properties" in result)
      .map((page) => notionPageToPostMeta(page))
      .filter((post): post is PostMeta => post !== null);

    return posts;
  } catch (error) {
    console.error("Notion 데이터베이스 조회 오류:", error);
    return [];
  }
};

/**
 * Notion 데이터베이스에서 모든 게시된 포스트 메타데이터 가져오기 (캐시 적용)
 * 캐시 만료 시간: 5분
 */
export const getAllPostsMeta = unstable_cache(
  _getAllPostsMeta,
  ["all-posts-meta"],
  {
    revalidate: 300, // 5분마다 캐시 재생성
    tags: ["posts", "notion"],
  }
);

// 캐시된 개별 포스트 조회 함수
const _getPostBySlug = async (slug: string) => {
  try {
    if (!DATABASE_ID) {
      console.error("NOTION_DATABASE_ID 환경변수가 설정되지 않았습니다.");
      return null;
    }

    // 슬러그로 페이지 검색
    const response = await notion.databases.query({
      database_id: DATABASE_ID,
      filter: {
        and: [
          {
            property: "상태",
            status: {
              equals: "글 작성 완료",
            },
          },
          {
            property: "슬러그",
            rich_text: {
              equals: slug,
            },
          },
        ],
      },
    });

    if (response.results.length === 0) {
      // 슬러그가 없는 경우 제목으로 검색
      const titleResponse = await notion.databases.query({
        database_id: DATABASE_ID,
        filter: {
          and: [
            {
              property: "상태",
              status: {
                equals: "글 작성 완료",
              },
            },
            {
              property: "제목",
              title: {
                contains: slug,
              },
            },
          ],
        },
      });

      if (titleResponse.results.length === 0) {
        return null;
      }

      if (!("properties" in titleResponse.results[0])) return null;
      const page = titleResponse.results[0] as PageObjectResponse;
      const meta = notionPageToPostMeta(page);

      if (!meta) return null;

      // 페이지 콘텐츠를 마크다운으로 변환
      const mdBlocks = await n2m.pageToMarkdown(page.id);
      const content = n2m.toMarkdownString(mdBlocks).parent;

      return {
        meta,
        content,
      };
    }

    if (!("properties" in response.results[0])) return null;
    const page = response.results[0] as PageObjectResponse;
    const meta = notionPageToPostMeta(page);

    if (!meta) return null;

    // 페이지 콘텐츠를 마크다운으로 변환
    const mdBlocks = await n2m.pageToMarkdown(page.id);
    const content = n2m.toMarkdownString(mdBlocks).parent;

    return {
      meta,
      content,
    };
  } catch (error) {
    console.error(`포스트 조회 오류 (${slug}):`, error);
    return null;
  }
};

/**
 * 특정 슬러그에 해당하는 포스트 가져오기 (메타데이터 + 콘텐츠, 캐시 적용)
 * 캐시 만료 시간: 10분
 */
export const getPostBySlug = (slug: string) =>
  unstable_cache(() => _getPostBySlug(slug), [`post-${slug}`], {
    revalidate: 600, // 10분마다 캐시 재생성
    tags: ["posts", "notion", `post-${slug}`],
  })();

// 캐시된 태그별 포스트 조회 함수
const _getPostsByTag = async (tag: string): Promise<PostMeta[]> => {
  try {
    const allPosts = await getAllPostsMeta();

    return allPosts.filter((post) =>
      post.tags?.some((postTag) => postTag.toLowerCase() === tag.toLowerCase())
    );
  } catch (error) {
    console.error(`태그별 포스트 조회 오류 (${tag}):`, error);
    return [];
  }
};

/**
 * 특정 태그가 포함된 포스트 목록 가져오기 (캐시 적용)
 */
export const getPostsByTag = (tag: string) =>
  unstable_cache(() => _getPostsByTag(tag), [`posts-by-tag-${tag}`], {
    revalidate: 300, // 5분마다 캐시 재생성
    tags: ["posts", "notion", `tag-${tag}`],
  })();

// 캐시된 모든 태그 조회 함수
const _getAllUniqueTags = async (): Promise<string[]> => {
  try {
    const allPosts = await getAllPostsMeta();

    const allTags = allPosts.reduce<string[]>((tags, post) => {
      if (post.tags && Array.isArray(post.tags)) {
        return [...tags, ...post.tags];
      }
      return tags;
    }, []);

    return [...new Set(allTags)].sort();
  } catch (error) {
    console.error("태그 목록 조회 오류:", error);
    return [];
  }
};

/**
 * 모든 고유 태그 목록 가져오기 (캐시 적용)
 */
export const getAllUniqueTags = unstable_cache(
  _getAllUniqueTags,
  ["all-unique-tags"],
  {
    revalidate: 300, // 5분마다 캐시 재생성
    tags: ["posts", "notion", "tags"],
  }
);
