import Link from "next/link";
import type { Post } from "@/lib/posts";

export function PostCard({ post }: { post: Post }) {
  const { slug, frontmatter } = post;
  return (
    <Link
      href={`/posts/${slug}`}
      className="group relative flex items-stretch gap-4 overflow-hidden rounded-3xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-lg sm:p-6"
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-tight transition group-hover:text-primary sm:text-xl">
            {frontmatter.pinned ? <span className="mr-1">📌</span> : null}
            {frontmatter.title}
          </h3>
          <time className="shrink-0 font-mono text-xs text-muted">
            {frontmatter.date}
          </time>
        </div>

        {frontmatter.description ? (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted">
            {frontmatter.description}
          </p>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1 text-xs">
          {frontmatter.tags?.length ? (
            <div className="flex flex-wrap gap-1.5">
              {frontmatter.tags.slice(0, 4).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 font-medium text-primary"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
          <span className="font-mono text-muted">
            · {frontmatter.readingMinutes} min
          </span>
        </div>
      </div>

      {frontmatter.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={frontmatter.cover}
          alt=""
          className="hidden h-20 w-20 shrink-0 self-center rounded-2xl object-cover sm:block"
        />
      ) : null}

      <div className="hidden shrink-0 self-center sm:block">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
          <svg
            aria-hidden
            className="h-5 w-5 transition group-hover:translate-x-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14" />
            <path d="M13 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
