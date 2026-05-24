import Link from "next/link";
import type { Post } from "@/lib/posts";
import { ReadBadge } from "@/components/ReadBadge";

export function PostCard({ post }: { post: Post }) {
  const { slug, frontmatter } = post;
  return (
    <Link
      href={`/posts/${slug}`}
      className="group flex flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-md sm:flex-row sm:items-start sm:gap-5 sm:p-5"
    >
      {frontmatter.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={frontmatter.cover}
          alt=""
          loading="lazy"
          decoding="async"
          className="aspect-[4/3] w-full shrink-0 rounded-xl object-cover sm:h-24 sm:w-32 sm:aspect-auto"
        />
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-baseline gap-2">
          {frontmatter.pinned ? (
            <span title="置顶" aria-label="置顶" className="text-sm">
              📌
            </span>
          ) : null}
          <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight transition group-hover:text-primary sm:text-lg">
            {frontmatter.title}
          </h3>
          <ReadBadge slug={slug} />
        </div>

        {frontmatter.description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted">
            {frontmatter.description}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <time className="font-mono">{frontmatter.date}</time>
          <span aria-hidden>·</span>
          <span className="font-mono">
            {frontmatter.wordCount.toLocaleString()} 字
          </span>
          <span aria-hidden>·</span>
          <span className="font-mono">{frontmatter.readingMinutes} min</span>
          {frontmatter.tags?.length ? (
            <>
              <span aria-hidden>·</span>
              <span className="flex flex-wrap gap-1">
                {frontmatter.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="font-medium text-primary/80"
                  >
                    #{tag}
                  </span>
                ))}
              </span>
            </>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
