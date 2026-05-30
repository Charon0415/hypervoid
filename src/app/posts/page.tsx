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
      <header className="group relative overflow-hidden border border-cyan-100/16 bg-gradient-to-br from-cyan-950/40 to-slate-950/60 p-5 sm:p-7" style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}>
        {/* Corner accents */}
        <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-px w-24 bg-gradient-to-r from-cyan-400/60 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-24 w-px bg-gradient-to-b from-cyan-400/60 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/45 to-transparent" />

        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
              <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-cyan-400/70">
                Archive_Index / Public_Transmission
              </p>
            </div>
            <h1 className="mt-3 font-mono text-3xl font-black uppercase leading-tight tracking-tight text-cyan-50 sm:text-5xl">
              All_Posts
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-cyan-50/62">
              以时间顺序展开的 Hypervoid 资料节点。技术、阅读、生活和兴趣都会在这里归档。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 border border-cyan-400/30 bg-cyan-400/15 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-cyan-100" style={{ clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%)' }}>
              <span className="h-1 w-1 rounded-full bg-cyan-400" />
              {posts.length} Nodes
            </span>
            <Link href="/tags" className="inline-flex items-center gap-1.5 border border-cyan-100/18 bg-cyan-950/30 px-4 py-1.5 font-mono text-xs font-medium uppercase tracking-wider text-cyan-100/80 transition hover:border-cyan-400/40 hover:bg-cyan-900/40 hover:text-cyan-300" style={{ clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%)' }}>
              <Tags className="h-3.5 w-3.5" aria-hidden />
              Tags
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
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
        <p className="border border-dashed border-cyan-100/20 bg-cyan-950/20 p-8 text-center font-mono text-sm uppercase tracking-wider text-cyan-50/60" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
          No_Posts_Yet
        </p>
      )}
    </div>
  );
}
