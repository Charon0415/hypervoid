import Link from "next/link";
import type { Post } from "@/lib/posts";

export function Backlinks({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;
  return (
    <section className="mt-12 border-t border-border pt-8">
      <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold tracking-tight">
        <span aria-hidden>↪</span>
        被这些文章引用
        <span className="text-xs font-normal text-muted">
          ({posts.length})
        </span>
      </h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/posts/${p.slug}`}
            className="group flex flex-col gap-0.5 rounded-lg border border-border bg-card p-3 transition hover:border-primary/40"
          >
            <p className="line-clamp-1 text-sm font-medium tracking-tight transition group-hover:text-primary">
              {p.frontmatter.title}
            </p>
            <p className="text-[10px] text-muted">
              {p.frontmatter.date}
              {p.frontmatter.tags.length > 0 ? (
                <>
                  {" · "}
                  <span className="font-mono">
                    {p.frontmatter.tags.slice(0, 3).join(", ")}
                  </span>
                </>
              ) : null}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
