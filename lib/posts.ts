// Notion 기반으로 변경됨 - 기존 MDX 파일 시스템은 유지하되 주 데이터 소스를 Notion으로 전환
import {
  getAllPostsMeta as getNotionPosts,
  getPostBySlug as getNotionPostBySlug,
  getPostsByTag as getNotionPostsByTag,
  getAllUniqueTags as getNotionUniqueTags,
} from "./notion";

export interface PostMeta {
  slug: string;
  title: string;
  date: string; // 날짜 형식은 'YYYY-MM-DD' 권장
  description: string;
  author: string; // 작성자 필드 추가
  image?: string; // image 필드는 선택적으로 설정
  heroImage?: string; // 히어로 이미지 (LCP 최적화를 위해 별도)
  tags?: string[]; // 태그 배열 추가
  isPublished?: boolean; // 게시 여부 필드 추가
  // 다른 필요한 메타데이터 추가 가능 (e.g., tags: string[])
}

// Notion에서 모든 포스트 메타데이터 가져오기
export async function getAllPostsMeta(): Promise<PostMeta[]> {
  return await getNotionPosts();
}

// 특정 슬러그에 해당하는 포스트 내용을 가져오는 함수 (글 상세 페이지용) - Notion 기반
export async function getPostBySlug(slug: string) {
  return await getNotionPostBySlug(slug);
}

// 특정 태그가 포함된 포스트 목록을 가져오는 함수 - Notion 기반
export async function getPostsByTag(tag: string): Promise<PostMeta[]> {
  return await getNotionPostsByTag(tag);
}

// 모든 고유 태그 목록을 가져오는 함수 - Notion 기반
export async function getAllUniqueTags(): Promise<string[]> {
  return await getNotionUniqueTags();
}
