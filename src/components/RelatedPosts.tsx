import Link from "next/link";
import { ArrowRight, Orbit } from "lucide-react";
import type { Post } from "@/lib/posts";

export function RelatedPosts({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;
  return (
    <section className="mt-12">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="hv-kicker">Related orbit</p>
          <h2 className="hv-title mt-1 text-xl font-semibold tracking-normal">
            相关文章
          </h2>
        </div>
        <span className="hv-chip">{posts.length} nodes</span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/posts/${p.slug}`}
            className="hv-panel hv-panel-hover group relative flex min-h-36 flex-col gap-2 overflow-hidden p-4"
          >
            <Orbit className="h-4 w-4 text-cyan-100/58" aria-hidden />
            <p className="line-clamp-2 text-sm font-semibold tracking-tight text-cyan-50 transition group-hover:text-cyan-100">
              {p.frontmatter.title}
            </p>
            {p.frontmatter.description ? (
              <p className="line-clamp-2 text-xs leading-relaxed text-cyan-50/58">
                {p.frontmatter.description}
              </p>
            ) : null}
            <span className="mt-auto flex items-center justify-between gap-2 font-mono text-[10px] uppercase text-cyan-50/48">
              <span>{p.frontmatter.date}</span>
              <span>{p.frontmatter.readingMinutes} min</span>
            </span>
            <ArrowRight className="absolute bottom-4 right-4 h-3.5 w-3.5 text-cyan-100/42 transition group-hover:translate-x-0.5 group-hover:text-cyan-50" aria-hidden />
          </Link>
        ))}
      </div>
    </section>
  );
}
