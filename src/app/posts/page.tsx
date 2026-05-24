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
          className="text-sm text-muted hover:text-primary"
        >
          按标签浏览 →
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
