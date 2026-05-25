"use client";

import { useReadLater } from "@/lib/use-read-later";

export function ReadLaterButton({
  slug,
  title,
  description,
}: {
  slug: string;
  title: string;
  description?: string | null;
}) {
  const { isQueued, toggle, ready } = useReadLater();
  const active = ready && isQueued(slug);

  return (
    <button
      type="button"
      onClick={() => toggle({ slug, title, description })}
      aria-label={active ? "从稍后读移除" : "稍后读"}
      title={active ? "已在稍后读 · 点击移除" : "稍后读 → /reading-list"}
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
        <circle cx="12" cy="12" r="9" />
        <polyline points="12 7 12 12 15 14" />
      </svg>
    </button>
  );
}
