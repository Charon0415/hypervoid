"use client";

import Link from "next/link";
import { useReadPosts } from "@/lib/use-read-posts";
import type { Post } from "@/lib/posts";

export function SeriesPostList({
  posts,
  seriesName,
}: {
  posts: Post[];
  seriesName: string;
}) {
  const readPosts = useReadPosts();
  const readCount = posts.filter((p) => readPosts.has(p.slug)).length;
  const total = posts.length;

  return (
    <>
      <header>
        <p className="text-xs uppercase tracking-widest text-primary">
          ✦ Series
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          {seriesName}
        </h1>
        <p className="mt-2 text-sm text-muted">
          共 {total} 篇
          {readCount > 0 ? (
            <span className="ml-2">
              · 已读 {readCount}/{total}
            </span>
          ) : null}
        </p>
        {total > 0 ? (
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${Math.round((readCount / total) * 100)}%` }}
            />
          </div>
        ) : null}
      </header>

      <ol className="flex flex-col gap-2">
        {posts.map((post, i) => {
          const isRead = readPosts.has(post.slug);
          return (
            <li key={post.slug}>
              <Link
                href={`/posts/${post.slug}`}
                className={`group flex items-baseline gap-4 rounded-xl border p-4 transition hover:shadow-sm ${
                  isRead
                    ? "border-border/50 bg-card/50"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <span className="shrink-0 font-mono text-sm text-muted">
                  {String(post.frontmatter.seriesOrder ?? i + 1).padStart(
                    2,
                    "0",
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`font-medium tracking-tight transition ${
                      isRead
                        ? "text-muted line-through decoration-muted/30"
                        : "group-hover:text-primary"
                    }`}
                  >
                    {post.frontmatter.title}
                  </p>
                  {post.frontmatter.description ? (
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted">
                      {post.frontmatter.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {isRead ? (
                    <span className="shrink-0 text-[10px] text-primary/60">
                      ✓ 已读
                    </span>
                  ) : null}
                  <time className="font-mono text-xs text-muted">
                    {post.frontmatter.date}
                  </time>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </>
  );
}
