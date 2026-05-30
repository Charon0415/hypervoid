"use client";

import Link from "next/link";
import { ArrowRight, Bookmark, Trash2 } from "lucide-react";
import { useBookmarks } from "@/lib/use-bookmarks";
import { formatDateCN } from "@/lib/datetime-client";

export function BookmarksList() {
  const { items, remove, ready } = useBookmarks();

  if (!ready) {
    return (
      <p className="hv-panel border-dashed p-8 text-center text-sm text-muted">
        加载中…
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <div className="hv-panel border-dashed p-8 text-center text-sm text-muted">
        <Bookmark className="mx-auto h-8 w-8 text-muted" aria-hidden />
        <p className="mt-3">收藏夹空空如也。</p>
        <p className="mt-2">
          在任意文章页右上角点书签图标即可加入。书签只存在你这台设备的浏览器里，不上传到服务器。
        </p>
        <div className="mt-4">
          <Link href="/posts" className="hv-action px-4 text-sm">
            去文章列表逛逛
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    );
  }

  const sorted = [...items].sort((a, b) => b.addedAt - a.addedAt);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-muted-soft">共 {items.length} 篇</p>
      <ul className="flex flex-col gap-2">
        {sorted.map((b) => (
          <li
            key={b.slug}
            className="hv-panel hv-panel-hover group flex items-start gap-3 p-4"
          >
            <Link href={"/posts/" + b.slug} className="min-w-0 flex-1">
              <p className="font-medium tracking-tight text-foreground transition group-hover:text-accent">
                {b.title}
              </p>
              {b.description ? (
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-soft">
                  {b.description}
                </p>
              ) : null}
              <p className="mt-1.5 font-mono text-[10px] uppercase text-muted-soft">
                收藏于 {formatDateCN(new Date(b.addedAt))}
              </p>
            </Link>
            <button
              type="button"
              onClick={() => remove(b.slug)}
              aria-label="移除收藏"
              className="shrink-0 border border-border bg-card p-1.5 text-muted-soft opacity-100 transition hover:border-red-400/45 hover:text-red-300 sm:opacity-0 sm:group-hover:opacity-100"
              title="移除收藏"
            >
              <Trash2 className="h-4 w-4" aria-hidden />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
