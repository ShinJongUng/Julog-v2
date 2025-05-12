import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "posts");

export interface PostMeta {
  slug: string;
  title: string;
  date: string; // 날짜 형식은 'YYYY-MM-DD' 권장
  description: string;
  author: string; // 작성자 필드 추가
  image?: string; // image 필드는 선택적으로 설정
  tags?: string[]; // 태그 배열 추가
  isPublished?: boolean; // 게시 여부 필드 추가
  // 다른 필요한 메타데이터 추가 가능 (e.g., tags: string[])
}

export function getAllPostsMeta(): PostMeta[] {
  let filenames: string[] = [];
  try {
    filenames = fs.readdirSync(postsDirectory);
  } catch (err) {
    console.error("Could not read posts directory:", err);
    return [];
  }

  const mdxFiles = filenames.filter((file) => path.extname(file) === ".mdx");

  const allPostsData = mdxFiles.map((fileName) => {
    // Remove ".mdx" from file name to get id
    const slug = fileName.replace(/\.mdx$/, "");

    // Read markdown file as string
    const fullPath = path.join(postsDirectory, fileName);
    let fileContents: string;
    try {
      fileContents = fs.readFileSync(fullPath, "utf8");
    } catch (err) {
      console.error(`Could not read file: ${fullPath}`, err);
      return null; // 파일 읽기 실패 시 null 반환
    }

    // Use gray-matter to parse the post metadata section
    const { data } = matter(fileContents);

    // 필수 메타데이터 검증
    if (!data.title || !data.date || !data.description) {
      console.warn(
        `Skipping ${fileName}: Missing required frontmatter fields (title, date, description).`
      );
      return null;
    }

    return {
      slug,
      ...data,
    } as PostMeta;
  });

  // null 값 제거 및 유효한 데이터만 필터링
  const validPosts = allPostsData.filter(
    (post): post is PostMeta =>
      post !== null && post.isPublished !== undefined && post.isPublished
  );

  // Sort posts by date (newest first)
  return validPosts.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else {
      return -1;
    }
  });
}

// 특정 슬러그에 해당하는 포스트 내용을 가져오는 함수 (글 상세 페이지용)
export async function getPostBySlug(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`);
  let fileContents: string;
  try {
    fileContents = fs.readFileSync(fullPath, "utf8");
  } catch (err) {
    console.error(`Could not read file: ${fullPath}`, err);
    return null; // 파일 없으면 null 반환
  }

  const { data, content } = matter(fileContents);

  // 필수 메타데이터 검증
  if (!data.title || !data.date || !data.description) {
    console.warn(
      `Post ${slug}: Missing required frontmatter fields (title, date, description). Content might still be available.`
    );
    // 메타데이터가 없어도 내용은 반환할 수 있도록 처리 (선택 사항)
  }

  return {
    meta: { slug, ...data } as PostMeta,
    content,
  };
}

// 특정 태그가 포함된 포스트 목록을 가져오는 함수
export function getPostsByTag(tag: string): PostMeta[] {
  const allPosts = getAllPostsMeta();

  // 태그로 포스트 필터링 (대소문자 구분 없이)
  return allPosts.filter((post) =>
    post.tags?.some((postTag) => postTag.toLowerCase() === tag.toLowerCase())
  );
}

// 모든 고유 태그 목록을 가져오는 함수
export function getAllUniqueTags(): string[] {
  const allPosts = getAllPostsMeta();

  // 모든 포스트의 모든 태그를 수집
  const allTags = allPosts.reduce<string[]>((tags, post) => {
    if (post.tags && Array.isArray(post.tags)) {
      return [...tags, ...post.tags];
    }
    return tags;
  }, []);

  // 중복 제거 및 정렬
  return [...new Set(allTags)].sort();
}
