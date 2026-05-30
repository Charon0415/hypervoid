import Link from "next/link";
import { ArrowRight, Pin, Sparkles } from "lucide-react";
import type { PostMeta } from "@/lib/posts";

export function DailyPick({ post }: { post: PostMeta }) {
  const { slug, frontmatter } = post;
  return (
    <Link
      href={`/posts/${slug}`}
      className="group relative flex items-center gap-4 overflow-hidden border border-cyan-100/16 bg-gradient-to-r from-cyan-950/40 to-slate-950/60 p-4 transition hover:border-cyan-400/40 hover:shadow-[0_0_28px_rgba(103,232,249,0.15)] sm:p-5"
      style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}
    >
      {/* Animated sparkle indicator */}
      <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-px w-20 bg-gradient-to-l from-cyan-400/60 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-20 w-px bg-gradient-to-b from-cyan-400/60 to-transparent" />

      <div className="grid h-12 w-12 shrink-0 place-items-center border border-cyan-400/30 bg-cyan-950/60 text-cyan-300 transition group-hover:border-cyan-400/50 group-hover:bg-cyan-900/50 group-hover:text-cyan-200" style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%)' }}>
        <Sparkles className="h-5 w-5 transition group-hover:scale-110" aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-cyan-400/80">
            Daily_Pick
          </p>
        </div>
        <p className="mt-1.5 flex min-w-0 items-center gap-1.5 text-sm font-semibold tracking-tight text-cyan-50 transition group-hover:text-cyan-100 sm:text-base">
          {frontmatter.pinned ? <Pin className="h-3.5 w-3.5 shrink-0 text-cyan-400/75" aria-hidden /> : null}
          <span className="line-clamp-1 min-w-0">{frontmatter.title}</span>
        </p>
        {frontmatter.description ? (
          <p className="mt-1 line-clamp-1 text-xs text-cyan-50/58">
            {frontmatter.description}
          </p>
        ) : null}
      </div>

      <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
        <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-50/50">
          {frontmatter.readingMinutes}m
        </span>
        <ArrowRight className="h-4 w-4 text-cyan-100/58 transition group-hover:translate-x-0.5 group-hover:text-cyan-300" aria-hidden />
      </div>
    </Link>
  );
}
