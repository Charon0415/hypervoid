import Link from "next/link";
import type { Post } from "@/lib/posts";

export function RelatedPosts({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;
  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="mb-4 text-lg font-semibold tracking-tight">
        相关文章
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/posts/${p.slug}`}
            className="group flex flex-col gap-1.5 rounded-xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm"
          >
            <p className="line-clamp-2 text-sm font-medium tracking-tight transition group-hover:text-primary">
              {p.frontmatter.title}
            </p>
            {p.frontmatter.description ? (
              <p className="line-clamp-2 text-xs text-muted">
                {p.frontmatter.description}
              </p>
            ) : null}
            <span className="mt-auto text-[10px] text-muted">
              {p.frontmatter.date} · {p.frontmatter.readingMinutes} min
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
