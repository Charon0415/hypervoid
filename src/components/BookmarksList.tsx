"use client";

import Link from "next/link";
import { useBookmarks } from "@/lib/use-bookmarks";
import { formatDateCN } from "@/lib/datetime-client";

export function BookmarksList() {
  const { items, remove, ready } = useBookmarks();

  if (!ready) {
    return (
      <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
        加载中…
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
        <p>收藏夹空空如也。</p>
        <p className="mt-2">
          在任意文章页右上角点 <span className="text-primary">⌘</span>{" "}
          书签图标即可加入。书签只存在你这台设备的浏览器里，不上传到服务器。
        </p>
        <div className="mt-4">
          <Link
            href="/posts"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-sm transition hover:border-primary/40 hover:text-primary"
          >
            去文章列表逛逛 →
          </Link>
        </div>
      </div>
    );
  }

  const sorted = [...items].sort((a, b) => b.addedAt - a.addedAt);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted">共 {items.length} 篇</p>
      <ul className="flex flex-col gap-2">
        {sorted.map((b) => (
          <li
            key={b.slug}
            className="group flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition hover:border-primary/40"
          >
            <Link
              href={`/posts/${b.slug}`}
              className="min-w-0 flex-1"
            >
              <p className="font-medium tracking-tight transition group-hover:text-primary">
                {b.title}
              </p>
              {b.description ? (
                <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                  {b.description}
                </p>
              ) : null}
              <p className="mt-1.5 font-mono text-[10px] text-muted">
                收藏于 {formatDateCN(new Date(b.addedAt))}
              </p>
            </Link>
            <button
              type="button"
              onClick={() => remove(b.slug)}
              aria-label="移除收藏"
              className="shrink-0 rounded-md p-1.5 text-muted opacity-0 transition hover:bg-background hover:text-red-500 group-hover:opacity-100"
              title="移除收藏"
            >
              <svg
                aria-hidden
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-2 14H7L5 6" />
                <path d="M10 11v6M14 11v6" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
