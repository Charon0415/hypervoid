"use client";

import { useBookmarks } from "@/lib/use-bookmarks";

export function BookmarkButton({
  slug,
  title,
  description,
}: {
  slug: string;
  title: string;
  description?: string | null;
}) {
  const { isBookmarked, toggle, ready } = useBookmarks();
  const active = ready && isBookmarked(slug);

  return (
    <button
      type="button"
      onClick={() => toggle({ slug, title, description })}
      aria-label={active ? "取消收藏" : "收藏文章"}
      title={active ? "取消收藏" : "加入收藏 → /bookmarks"}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border transition ${
        active
          ? "border-primary/50 bg-primary/15 text-primary"
          : "border-border bg-card text-muted hover:border-primary/40 hover:text-primary"
      }`}
    >
      <svg
        aria-hidden
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
