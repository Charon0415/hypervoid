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
        className="group inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground/80 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
      >
        <svg
          aria-hidden
          className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        所有标签
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
