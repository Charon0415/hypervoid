import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { PostCard } from "@/components/PostCard";
import { SearchBox } from "@/components/SearchBox";
import { searchPosts } from "@/lib/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "搜索",
  description: "搜索文章",
  robots: { index: false, follow: false },
};

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await props.searchParams;
  const query = q.trim();
  const hits = query ? await searchPosts(query) : [];

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex items-baseline gap-3">
          <Link
            href="/"
            className="text-sm text-muted hover:text-primary"
          >
            ← 首页
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">搜索</h1>
        </div>
        <Suspense fallback={null}>
          <SearchBox initial={query} />
        </Suspense>
      </header>

      {!query ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          输入关键词开始搜索（支持中文）。
        </p>
      ) : hits.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          没有匹配「<span className="text-foreground">{query}</span>」的文章。
        </p>
      ) : (
        <>
          <p className="text-sm text-muted">
            找到 {hits.length} 篇匹配「
            <span className="text-foreground">{query}</span>」的文章
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {hits.map((hit) => (
              <PostCard key={hit.slug} post={hit} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
