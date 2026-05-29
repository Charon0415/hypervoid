import Link from "next/link";
import { ArrowRight, Pin, Sparkles } from "lucide-react";
import type { PostMeta } from "@/lib/posts";

export function DailyPick({ post }: { post: PostMeta }) {
  const { slug, frontmatter } = post;
  return (
    <Link
      href={`/posts/${slug}`}
      className="hv-panel hv-panel-hover group flex items-center gap-4 p-4 sm:p-5"
    >
      <div className="grid h-12 w-12 shrink-0 place-items-center border border-cyan-100/18 bg-cyan-50/[0.055] text-cyan-100">
        <Sparkles className="h-5 w-5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="hv-kicker">
          今日抽取 · Daily pick
        </p>
        <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-sm font-semibold tracking-tight text-cyan-50 transition group-hover:text-cyan-100 sm:text-base">
          {frontmatter.pinned ? <Pin className="h-3.5 w-3.5 shrink-0 text-cyan-100/75" aria-hidden /> : null}
          <span className="line-clamp-1 min-w-0">{frontmatter.title}</span>
        </p>
        {frontmatter.description ? (
          <p className="mt-0.5 line-clamp-1 text-xs text-cyan-50/58">
            {frontmatter.description}
          </p>
        ) : null}
      </div>
      <span className="hidden shrink-0 font-mono text-xs uppercase text-cyan-50/50 sm:inline">
        {frontmatter.readingMinutes} min
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-cyan-100/58 transition group-hover:translate-x-0.5 group-hover:text-cyan-50" aria-hidden />
    </Link>
  );
}
