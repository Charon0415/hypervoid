import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Tags } from "lucide-react";
import { PostCard } from "@/components/PostCard";
import { PostsGrid } from "@/components/PostsGrid";
import { getAllPostMeta } from "@/lib/posts";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "文章",
  description: "所有文章列表",
};

export default async function PostsIndex() {
  const posts = await getAllPostMeta().catch((error) => {
    console.warn("[posts] failed to load post list:", error instanceof Error ? error.message : error);
    return [];
  });
  return (
    <div className="flex flex-col gap-6">
      <header className="hv-panel relative overflow-hidden p-5 sm:p-7">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/45 to-transparent" />
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="hv-kicker">Archive index / public transmission</p>
            <h1 className="hv-title mt-2 text-3xl font-black leading-tight sm:text-5xl">
              所有文章
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-cyan-50/62">
              以时间顺序展开的 Hypervoid 资料节点。技术、阅读、生活和兴趣都会在这里归档。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="hv-chip hv-chip-strong">{posts.length} nodes</span>
            <Link href="/tags" className="hv-action px-4 text-sm font-semibold">
              <Tags className="h-4 w-4" aria-hidden />
              按标签浏览
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </header>
      {posts.length ? (
        <PostsGrid>
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </PostsGrid>
      ) : (
        <p className="hv-panel border-dashed p-8 text-center text-cyan-50/60">
          还没有文章。
        </p>
      )}
    </div>
  );
}
