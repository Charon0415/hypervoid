import Link from "next/link";
import type { PostMeta } from "@/lib/posts";

export function DailyPick({ post }: { post: PostMeta }) {
  const { slug, frontmatter } = post;
  return (
    <Link
      href={`/posts/${slug}`}
      className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-md sm:p-5"
    >
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-xl text-primary">
        ✦
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-widest text-muted">
          今日抽取 · Daily pick
        </p>
        <p className="mt-0.5 line-clamp-1 text-sm font-semibold tracking-tight transition group-hover:text-primary sm:text-base">
          {frontmatter.pinned ? <span className="mr-1">📌</span> : null}
          {frontmatter.title}
        </p>
        {frontmatter.description ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-muted">
            {frontmatter.description}
          </p>
        ) : null}
      </div>
      <span className="hidden shrink-0 text-xs text-muted sm:inline">
        {frontmatter.readingMinutes} min
      </span>
      <svg
        aria-hidden
        className="h-4 w-4 shrink-0 text-muted transition group-hover:translate-x-0.5 group-hover:text-primary"
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
