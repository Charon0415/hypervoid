import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { PostCard } from "@/components/PostCard";
import { PostsGrid } from "@/components/PostsGrid";
import { getAllTags, getPostsByTag } from "@/lib/posts";

type Params = { tag: string };

export const revalidate = 60;

export async function generateStaticParams(): Promise<Params[]> {
  const tags = await getAllTags();
  return tags.map(({ tag }) => ({ tag }));
}

export const dynamicParams = false;

export async function generateMetadata(
  props: { params: Promise<Params> },
): Promise<Metadata> {
  const { tag } = await props.params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `#${decoded}`,
    description: `所有标记为 #${decoded} 的文章`,
  };
}

export default async function TagDetailPage(props: {
  params: Promise<Params>;
}) {
  const { tag } = await props.params;
  const decoded = decodeURIComponent(tag);
  const posts = await getPostsByTag(decoded);
  if (posts.length === 0) notFound();

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/tags"
        className="text-sm text-muted hover:text-primary"
      >
        ← 所有标签
      </Link>
      <header className="flex items-baseline gap-3">
        <h1 className="text-3xl font-bold tracking-tight">#{decoded}</h1>
        <span className="text-sm text-muted">{posts.length} 篇文章</span>
      </header>
      <PostsGrid>
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </PostsGrid>
    </div>
  );
}
