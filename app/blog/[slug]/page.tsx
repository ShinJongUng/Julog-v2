import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPostsMeta, getPostBySlug } from "@/lib/posts";
import { formatDate } from "@/lib/utils";
import { getMDXComponents } from "@/mdx-components";
import type { Metadata } from "next";
import TableOfContents from "@/components/TableOfContents";
import Link from "next/link";
import Giscus from "@/components/Giscus";
import FloatingButtons from "@/components/FloatingButtons";

interface PostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  const posts = getAllPostsMeta();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({
  params,
}: PostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const postData = await getPostBySlug(resolvedParams.slug);

  if (!postData) {
    return {
      title: "Post Not Found",
    };
  }

  const { meta } = postData;

  const ogImage = meta.image || "";
  return {
    title: meta.title,
    description: meta.description,
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: "article",
      publishedTime: new Date(meta.date).toISOString(),
      url: `https://blog.jongung.com.com/blog/${meta.slug}`,
      images: [ogImage],
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const resolvedParams = await params;
  const postData = await getPostBySlug(resolvedParams.slug);

  if (!postData) {
    notFound();
  }

  const { meta, content } = postData;
  const components = getMDXComponents({});

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 py-6 md:py-8">
        <article className="prose dark:prose-invert lg:col-span-3 max-w-none">
          <header className="mb-6 md:mb-8 border-b pb-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {meta.title}
            </h1>

            {meta.tags && Array.isArray(meta.tags) && meta.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 not-prose mt-2">
                {meta.tags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/tag/${encodeURIComponent(tag.toLowerCase())}`}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted hover:text-green-600 dark:hover:text-green-400 transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              {formatDate(meta.date)}
            </p>
          </header>

          <MDXRemote
            source={content}
            components={components}
            options={{
              mdxOptions: {},
            }}
          />

          <footer className="mt-8 md:mt-12 border-t pt-6">
            {/* 댓글 섹션은 여기 있지만 화면에 직접 표시되지 않고 버튼을 통해 이동함 */}
            <div id="comments" className="mt-8 scroll-mt-24">
              <Giscus />
            </div>
          </footer>
        </article>

        {/* 우측 목차 영역 */}
        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <h4 className="text-sm font-semibold mb-4">목차</h4>
            <TableOfContents />
          </div>
        </aside>
      </div>

      {/* 플로팅 버튼 추가 */}
      <FloatingButtons commentSectionId="comments" />
    </>
  );
}
