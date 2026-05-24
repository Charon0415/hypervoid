import type { Metadata } from "next";
import Link from "next/link";
import { PostCard } from "@/components/PostCard";
import { PostsGrid } from "@/components/PostsGrid";
import { getAllPosts } from "@/lib/posts";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "文章",
  description: "所有文章列表",
};

export default async function PostsIndex() {
  const posts = await getAllPosts();
  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-3xl font-bold tracking-tight">所有文章</h1>
          <span className="text-sm text-muted">共 {posts.length} 篇</span>
        </div>
        <Link
          href="/tags"
          className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground/80 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          按标签浏览
          <svg
            aria-hidden
            className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="M13 5l7 7-7 7" />
          </svg>
        </Link>
      </header>
      {posts.length ? (
        <PostsGrid>
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </PostsGrid>
      ) : (
        <p className="rounded-3xl border border-dashed border-border p-8 text-center text-muted">
          还没有文章。
        </p>
      )}
    </div>
  );
}
