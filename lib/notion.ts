import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { PostMeta } from "./posts";
import type {
  BlockObjectResponse,
  ImageBlockObjectResponse,
  PageObjectResponse,
} from "@notionhq/client/build/src/api-endpoints";
import type { NotionPageProperties } from "./notion-types";
import { cache } from "react";
import { getProxyImageUrl, fileNameFromUrl } from "./image-utils";

// Notion 클라이언트 초기화
const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const n2m = new NotionToMarkdown({ notionClient: notion });
// 이미지 블록을 block_id 기반 프록시 URL로 변환
n2m.setCustomTransformer("image", async (block) => {
  try {
    const blockId: string = block.id;
    const img = (block as ImageBlockObjectResponse).image;
    if (!img) return "";
    const type: string = img.type;

    // 타입 가드를 사용하여 안전하게 속성 접근
    let link: string | undefined;
    if (type === "file" && "file" in img) {
      link = img.file?.url;
    } else if (type === "external" && "external" in img) {
      link = img.external?.url;
    }
    const caption: string = (img.caption || [])
      .map((c: { plain_text: string }) => c?.plain_text || "")
      .join("")
      .trim();
    const fileName =
      fileNameFromUrl(link) || (caption ? `${caption}.png` : "image");
    const proxy = getProxyImageUrl(blockId, fileName);
    const alt = caption || fileName || "image";
    const title = caption ? ` \"${caption.replace(/"/g, '\\"')}\"` : "";
    // Markdown 이미지에 title을 넣어 MDX 컴포넌트에서 캡션으로 사용
    return `![${alt}](${proxy}${title})`;
  } catch (e) {
    console.error("image transformer error", e);
    return "";
  }
});

// 빈 paragraph 블록을 빈 줄로 변환하여 여러 줄 바꿈 지원
n2m.setCustomTransformer("paragraph", async (block) => {
  const paragraphBlock = block as BlockObjectResponse & {
    paragraph?: { rich_text: Array<{ plain_text: string }> };
  };
  const richText = paragraphBlock.paragraph?.rich_text || [];
  const text = richText.map((t) => t.plain_text || "").join("");

  // 빈 paragraph는 빈 줄을 나타내므로 &nbsp;를 반환
  if (text.trim() === "") {
    return "&nbsp;";
  }

  // 일반 텍스트는 기본 변환 사용 (false 반환)
  return false;
});

// Notion 데이터베이스 ID (환경변수에서 가져옴)
const DATABASE_ID = process.env.NOTION_DATABASE_ID || "";

// Notion 페이지 속성 타입 정의 - PageObjectResponse 사용
type NotionPage = PageObjectResponse;

/**
 * Notion 페이지 데이터를 PostMeta 형식으로 변환
 */
async function notionPageToPostMeta(
  page: NotionPage
): Promise<PostMeta | null> {
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

    // 썸네일 이미지 결정: 페이지의 첫 번째 이미지 블록을 우선 사용 (block_id 기반 프록시)
    let image: string | undefined;
    const firstImageBlock = await findFirstImageBlockId(page.id);
    if (firstImageBlock) {
      image = getProxyImageUrl(
        firstImageBlock.blockId,
        firstImageBlock.fileName
      );
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

    const posts = (
      await Promise.all(
        response.results
          .filter(
            (result): result is PageObjectResponse => "properties" in result
          )
          .map((page) => notionPageToPostMeta(page))
      )
    ).filter((post): post is PostMeta => post !== null);

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
export const getAllPostsMeta = cache(async () => {
  return await _getAllPostsMeta();
});

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
      const meta = await notionPageToPostMeta(page);

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
    const meta = await notionPageToPostMeta(page);

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
 * 특정 슬러그에 해당하는 포스트 가져오기 (메타데이터 + 콘텐츠, React cache 적용)
 * 요청별 캐싱으로 동일 요청에 대한 중복 API 호출 방지
 */
export const getPostBySlug = cache(async (slug: string) => {
  return await _getPostBySlug(slug);
});

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
 * 특정 태그가 포함된 포스트 목록 가져오기 (React cache 적용)
 */
export const getPostsByTag = cache(async (tag: string) => {
  return await _getPostsByTag(tag);
});

// 첫 번째 이미지 블록을 찾는 유틸 (얕은 탐색)
async function findFirstImageBlockId(
  pageId: string
): Promise<{ blockId: string; fileName?: string } | null> {
  try {
    const res = await notion.blocks.children.list({
      block_id: pageId,
      page_size: 100,
    });
    const results = (res.results || []) as BlockObjectResponse[];
    for (const b of results) {
      if (b.type === "image" && b.image) {
        const link: string | undefined =
          b.image.type === "file" ? b.image.file?.url : b.image.external?.url;
        return { blockId: b.id, fileName: fileNameFromUrl(link) };
      }
    }
    return null;
  } catch (e) {
    console.error("findFirstImageBlockId error", e);
    return null;
  }
}

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
 * 모든 고유 태그 목록 가져오기 (React cache 적용)
 */
export const getAllUniqueTags = cache(async () => {
  return await _getAllUniqueTags();
});
