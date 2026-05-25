"use client";

import Link from "next/link";
import { useReadLater } from "@/lib/use-read-later";

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  if (diff < hour) return `${Math.floor(diff / minute) || 1} 分钟前`;
  if (diff < day) return `${Math.floor(diff / hour)} 小时前`;
  if (diff < 7 * day) return `${Math.floor(diff / day)} 天前`;
  return new Date(ts).toLocaleDateString("zh-CN");
}

export function ReadLaterList() {
  const { items, remove, clear, ready } = useReadLater();

  if (!ready) {
    return (
      <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
        加载中…
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
        稍后读队列是空的。文章页点{" "}
        <span className="mx-0.5 inline-block">
          <svg
            aria-hidden
            className="inline h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <polyline points="12 7 12 12 15 14" />
          </svg>
        </span>{" "}
        把感兴趣的文章塞进来。
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          共 <span className="font-mono text-foreground">{items.length}</span> 篇
        </p>
        <button
          type="button"
          onClick={() => {
            if (confirm("清空整个稍后读队列？")) clear();
          }}
          className="text-xs text-muted hover:text-red-500"
        >
          清空
        </button>
      </div>
      <ul className="flex flex-col gap-2">
        {items.map((it) => (
          <li
            key={it.slug}
            className="group flex items-start gap-3 rounded-xl border border-border bg-card p-3 transition hover:border-primary/40"
          >
            <div className="min-w-0 flex-1">
              <Link
                href={`/posts/${it.slug}`}
                className="line-clamp-1 text-sm font-medium hover:text-primary"
              >
                {it.title}
              </Link>
              {it.description ? (
                <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                  {it.description}
                </p>
              ) : null}
              <p className="mt-1 text-[10px] text-muted">
                加入于 {formatRelative(it.addedAt)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => remove(it.slug)}
              aria-label="移除"
              className="shrink-0 rounded-md border border-border bg-background px-2 py-1 text-[10px] text-muted opacity-0 transition hover:border-red-500/40 hover:text-red-500 group-hover:opacity-100"
            >
              移除
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
