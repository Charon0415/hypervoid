import Image from "next/image";
import Link from "next/link";
import { BookOpenText, Clock3, Pin, ScanSearch } from "lucide-react";
import type { Post } from "@/lib/posts";
import { ReadBadge } from "@/components/ReadBadge";
import { highlight } from "@/lib/highlight";

export function SearchHitCard({ post, query }: { post: Post; query: string }) {
  const { slug, frontmatter } = post;
  const snippet = buildSnippet(post.content, query);

  return (
    <Link
      href={`/posts/${slug}`}
      className="hv-panel hv-panel-hover group flex flex-col gap-3 overflow-hidden p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5"
    >
      {frontmatter.cover ? (
        <Image
          src={frontmatter.cover}
          alt=""
          width={256}
          height={192}
          sizes="(min-width: 640px) 128px, 100vw"
          loading="lazy"
          className="aspect-[4/3] w-full shrink-0 border border-border object-cover opacity-[0.86] saturate-[0.85] transition group-hover:opacity-100 group-hover:saturate-100 sm:h-24 sm:w-32 sm:aspect-auto"
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-baseline gap-2">
          {frontmatter.pinned ? (
            <span title="置顶" aria-label="置顶" className="hv-chip hv-chip-strong">
              <Pin className="h-3 w-3" aria-hidden />
            </span>
          ) : null}
          <h3 className="hv-title line-clamp-2 text-base font-semibold leading-snug tracking-tight transition group-hover:text-accent sm:text-lg">
            {highlight(frontmatter.title, query)}
          </h3>
          <ReadBadge slug={slug} />
        </div>

        {frontmatter.description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted">
            {highlight(frontmatter.description, query)}
          </p>
        ) : null}

        {snippet ? (
          <p className="line-clamp-2 border border-dashed border-border bg-card px-2.5 py-1.5 text-xs leading-relaxed text-muted-soft">
            <ScanSearch className="mr-1 inline h-3 w-3 text-muted" aria-hidden />
            … {highlight(snippet, query)} …
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase text-muted-soft">
          <time className="font-mono">{frontmatter.date}</time>
          <span className="inline-flex items-center gap-1">
            <BookOpenText className="h-3.5 w-3.5" aria-hidden />
            {frontmatter.wordCount.toLocaleString()} 字
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" aria-hidden />
            {frontmatter.readingMinutes} min
          </span>
          {frontmatter.tags?.length ? (
            <span className="flex flex-wrap gap-1">
              {frontmatter.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="font-medium text-accent-soft">
                  #{tag}
                </span>
              ))}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

/**
 * Strip markdown noise, then pull a short window centered on the first match.
 * Returns "" if no match — caller hides the snippet line entirely.
 */
function buildSnippet(content: string, query: string, window = 90): string {
  const q = query.trim();
  if (!q) return "";

  // Cheap markdown cleanup: strip code fences, html tags, link syntax to text.
  const plain = content
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/[#>*_~|]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const lower = plain.toLowerCase();
  const idx = lower.indexOf(q.toLowerCase());
  if (idx < 0) return "";

  const start = Math.max(0, idx - Math.floor(window / 3));
  const end = Math.min(plain.length, start + window);
  return plain.slice(start, end);
}
