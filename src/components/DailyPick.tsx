import Link from "next/link";
import type { Post } from "@/lib/posts";

export function DailyPick({ post }: { post: Post }) {
  const { slug, frontmatter } = post;
  return (
    <Link
      href={`/posts/${slug}`}
      className="group flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-2.5 transition hover:border-primary/40 hover:shadow-sm"
    >
      <span className="shrink-0 text-sm" aria-hidden>✦</span>
      <span className="text-[10px] uppercase tracking-widest text-muted">
        今日抽取
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium tracking-tight transition group-hover:text-primary">
        {frontmatter.pinned ? <span className="mr-1">📌</span> : null}
        {frontmatter.title}
      </span>
      <span className="hidden shrink-0 font-mono text-[10px] text-muted sm:inline">
        {frontmatter.readingMinutes} min
      </span>
      <svg
        aria-hidden
        className="h-3.5 w-3.5 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-primary"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 12h14M13 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
