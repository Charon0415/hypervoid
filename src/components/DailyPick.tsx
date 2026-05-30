import Link from "next/link";
import { ArrowRight, Pin, Sparkles } from "lucide-react";
import type { PostMeta } from "@/lib/posts";

export function DailyPick({ post }: { post: PostMeta }) {
  const { slug, frontmatter } = post;
  return (
    <Link
      href={`/posts/${slug}`}
      className="group relative flex items-center gap-4 overflow-hidden rounded-2xl p-3 transition sm:p-4"
      style={{ background: "linear-gradient(145deg, rgba(239,68,68,0.1), rgba(249,115,22,0.08), rgba(234,179,8,0.07), rgba(34,197,94,0.08), rgba(6,182,212,0.1), rgba(59,130,246,0.12), rgba(99,102,241,0.1), rgba(139,92,246,0.09), rgba(217,70,239,0.08), rgba(12,18,36,0.82))", border: "1px solid rgba(255,255,255,0.1)" }}
    >
      {/* Animated sparkle indicator */}
      <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-px w-20" style={{ background: "linear-gradient(270deg, rgba(239,68,68,0.5), rgba(234,179,8,0.4), rgba(59,130,246,0.4), transparent)" }} />
      <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-20 w-px" style={{ background: "linear-gradient(180deg, rgba(139,92,246,0.5), rgba(59,130,246,0.3), transparent)" }} />

      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl transition group-hover:shadow-[0_0_20px_var(--rainbow-glow)]" style={{ background: "linear-gradient(135deg, rgba(239,68,68,0.12), rgba(234,179,8,0.1), rgba(59,130,246,0.15), rgba(139,92,246,0.12), rgba(12,18,36,0.8))", border: "1px solid rgba(255,255,255,0.12)", color: "var(--accent-soft)" }}>
        <Sparkles className="h-5 w-5 transition group-hover:scale-110" aria-hidden />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "var(--rainbow)" }} />
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-accent/80">
            Daily_Pick
          </p>
        </div>
        <p className="mt-1 flex min-w-0 items-center gap-1.5 text-sm font-semibold tracking-tight text-readable-light transition group-hover:text-white">
          {frontmatter.pinned ? <Pin className="h-3.5 w-3.5 shrink-0 text-accent/75" aria-hidden /> : null}
          <span className="line-clamp-1 min-w-0">{frontmatter.title}</span>
        </p>
        {frontmatter.description ? (
          <p className="mt-1 line-clamp-1 text-xs text-muted" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
            {frontmatter.description}
          </p>
        ) : null}
      </div>

      <div className="hidden shrink-0 flex-col items-end gap-1 sm:flex">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-soft">
          {frontmatter.readingMinutes}m
        </span>
        <ArrowRight className="h-4 w-4 text-muted transition group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden />
      </div>
    </Link>
  );
}
