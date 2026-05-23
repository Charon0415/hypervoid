import Link from "next/link";
import type { Post } from "@/lib/posts";

export function PostCard({ post }: { post: Post }) {
  const { slug, frontmatter } = post;
  return (
    <Link
      href={`/posts/${slug}`}
      className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 transition hover:border-primary hover:shadow-md"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-tight group-hover:text-primary">
          {frontmatter.pinned ? <span className="mr-1">📌</span> : null}
          {frontmatter.title}
        </h3>
        <time className="shrink-0 text-xs text-muted">{frontmatter.date}</time>
      </div>
      {frontmatter.description ? (
        <p className="line-clamp-2 text-sm text-muted">
          {frontmatter.description}
        </p>
      ) : null}
      <div className="mt-1 flex items-center justify-between gap-3 text-xs">
        {frontmatter.tags?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {frontmatter.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2 py-0.5 text-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : (
          <span />
        )}
        <span className="shrink-0 text-muted">
          {frontmatter.readingMinutes} 分钟
        </span>
      </div>
    </Link>
  );
}
