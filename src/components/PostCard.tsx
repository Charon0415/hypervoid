import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenText, Clock3, Pin, Radio } from "lucide-react";
import type { PostMeta } from "@/lib/posts";
import { ReadBadge } from "@/components/ReadBadge";

export function PostCard({ post }: { post: PostMeta }) {
  const { slug, frontmatter } = post;
  return (
    <Link
      href={`/posts/${slug}`}
      className="hv-panel hv-panel-hover group relative flex flex-col gap-4 overflow-hidden p-4 sm:flex-row sm:items-stretch sm:gap-5 sm:p-5"
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/40 to-transparent opacity-60" />
      <div className="relative h-40 w-full shrink-0 overflow-hidden border border-cyan-100/14 bg-cyan-50/[0.035] sm:h-auto sm:w-36">
        {frontmatter.cover ? (
          <Image
            src={frontmatter.cover}
            alt=""
            fill
            sizes="(min-width: 640px) 144px, 100vw"
            loading="lazy"
            className="object-cover opacity-[0.82] saturate-[0.85] transition duration-300 group-hover:scale-105 group-hover:opacity-100 group-hover:saturate-100"
          />
        ) : (
          <div className="grid h-full min-h-32 place-items-center bg-[radial-gradient(circle_at_50%_50%,rgba(103,232,249,.18),transparent_48%),linear-gradient(135deg,rgba(255,255,255,.055),transparent)]">
            <Radio className="h-8 w-8 text-cyan-100/60" aria-hidden />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,.38))]" />
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,.12)_0_1px,transparent_1px_5px)] opacity-[0.06]" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {frontmatter.pinned ? (
            <span className="hv-chip hv-chip-strong" title="置顶">
              <Pin className="h-3 w-3" aria-hidden />
              Pinned
            </span>
          ) : null}
          <span className="hv-chip">
            <BookOpenText className="h-3 w-3" aria-hidden />
            Article
          </span>
          <ReadBadge slug={slug} />
        </div>

        <h3 className="hv-title line-clamp-2 text-lg font-semibold leading-snug transition group-hover:text-cyan-100 sm:text-xl">
          {frontmatter.title}
        </h3>

        {frontmatter.description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-cyan-50/62">
            {frontmatter.description}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px] uppercase text-cyan-50/50">
          <time>{frontmatter.date}</time>
          <span className="inline-flex items-center gap-1">
            <BookOpenText className="h-3.5 w-3.5" aria-hidden />
            {frontmatter.wordCount.toLocaleString()} 字
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" aria-hidden />
            {frontmatter.readingMinutes} min
          </span>
          {frontmatter.tags?.length ? (
            <span className="flex flex-wrap gap-1.5">
              {frontmatter.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-cyan-100/72">
                  #{tag}
                </span>
              ))}
            </span>
          ) : null}
        </div>
      </div>

      <span className="absolute bottom-4 right-4 hidden h-9 w-9 place-items-center border border-cyan-100/18 bg-white/[0.045] text-cyan-100/70 transition group-hover:border-cyan-100/40 group-hover:text-cyan-50 sm:grid">
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
      </span>
    </Link>
  );
}
