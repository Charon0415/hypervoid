import type { Metadata } from "next";
import { PostCard } from "@/components/PostCard";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "文章",
  description: "所有文章列表",
};

export default function PostsIndex() {
  const posts = getAllPosts();
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-baseline gap-3">
        <h1 className="text-3xl font-bold tracking-tight">所有文章</h1>
        <span className="text-sm text-muted">共 {posts.length} 篇</span>
      </header>
      {posts.length ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          还没有文章。
        </p>
      )}
    </div>
  );
}
