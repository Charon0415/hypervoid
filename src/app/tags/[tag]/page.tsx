import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Hash } from "lucide-react";
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
    <div className="flex flex-col gap-6">
      <Link href="/tags" className="hv-action w-fit px-4 text-sm font-medium">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        所有标签
      </Link>
      <header className="hv-panel relative overflow-hidden p-5 sm:p-7">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <p className="hv-kicker">Filtered channel / tag transmission</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="hv-title flex items-center gap-3 text-3xl font-black leading-tight sm:text-5xl">
            <Hash className="h-8 w-8 text-muted sm:h-10 sm:w-10" aria-hidden />
            {decoded}
          </h1>
          <span className="hv-chip hv-chip-strong">{posts.length} nodes</span>
        </div>
      </header>
      <PostsGrid>
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </PostsGrid>
    </div>
  );
}
