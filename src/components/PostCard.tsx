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
      className="hv-card group relative flex flex-col gap-3 overflow-hidden p-3 sm:flex-row sm:items-stretch sm:gap-3 sm:p-3.5"
    >
      <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-md bg-cyan-950/20 sm:h-auto sm:w-32">
        {frontmatter.cover ? (
          <Image
            src={frontmatter.cover}
            alt=""
            fill
            sizes="(min-width: 640px) 128px, 100vw"
            loading="lazy"
            className="object-cover opacity-[0.82] saturate-[0.85] transition duration-300 group-hover:scale-105 group-hover:opacity-100 group-hover:saturate-100"
          />
        ) : (
          <div className="grid h-full min-h-24 place-items-center bg-[radial-gradient(circle_at_50%_50%,rgba(103,232,249,.18),transparent_48%),linear-gradient(135deg,rgba(255,255,255,.055),transparent)]">
            <Radio className="h-8 w-8 text-cyan-100/60" aria-hidden />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,.38))]" />
        <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,.12)_0_1px,transparent_1px_5px)] opacity-[0.06]" />
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          {frontmatter.pinned ? (
            <span className="hv-chip-sci" title="置顶">
              <Pin className="h-3 w-3" aria-hidden />
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider">Pinned</span>
            </span>
          ) : null}
          <span className="hv-chip-sci hv-chip-sci-dim">
            <BookOpenText className="h-3 w-3" aria-hidden />
            <span className="font-mono text-[10px] uppercase tracking-wider">Article</span>
          </span>
          <ReadBadge slug={slug} />
        </div>

        <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-cyan-50 transition group-hover:text-cyan-100 sm:text-lg">
          {frontmatter.title}
        </h3>

        {frontmatter.description ? (
          <p className="line-clamp-2 text-sm leading-snug text-cyan-50/62">
            {frontmatter.description}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-cyan-100/8 pt-2 font-mono text-[10px] uppercase tracking-wider text-cyan-50/50">
          <time className="inline-flex items-center gap-1.5">
            <span className="h-1 w-1 rounded-full bg-cyan-400/60" />
            {frontmatter.date}
          </time>
          <span className="inline-flex items-center gap-1">
            <BookOpenText className="h-3 w-3" aria-hidden />
            {frontmatter.wordCount.toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3 w-3" aria-hidden />
            {frontmatter.readingMinutes}m
          </span>
          {frontmatter.tags?.length ? (
            <span className="flex flex-wrap gap-1.5">
              {frontmatter.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-cyan-300/60">
                  #{tag}
                </span>
              ))}
            </span>
          ) : null}
        </div>
      </div>

      <span className="absolute bottom-3 right-3 hidden place-items-center text-cyan-100/70 transition group-hover:text-cyan-300 sm:grid">
        <span className="grid h-8 w-8 place-items-center rounded-md border border-cyan-100/18 bg-cyan-950/40 backdrop-blur-sm transition group-hover:border-cyan-300/40 group-hover:bg-cyan-900/30">
          <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden />
        </span>
      </span>
    </Link>
  );
}
