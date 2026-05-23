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
          {frontmatter.title}
        </h3>
        <time className="shrink-0 text-xs text-muted">{frontmatter.date}</time>
      </div>
      {frontmatter.description ? (
        <p className="line-clamp-2 text-sm text-muted">
          {frontmatter.description}
        </p>
      ) : null}
      {frontmatter.tags?.length ? (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {frontmatter.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border px-2 py-0.5 text-xs text-muted"
            >
              #{tag}
            </span>
          ))}
        </div>
      ) : null}
    </Link>
  );
}
