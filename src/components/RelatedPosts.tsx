import Link from "next/link";
import { ArrowRight, Orbit } from "lucide-react";
import type { Post } from "@/lib/posts";

export function RelatedPosts({ posts }: { posts: Post[] }) {
  if (posts.length === 0) return null;
  return (
    <section className="mt-12">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-7 w-7 place-items-center border border-cyan-400/30 bg-cyan-950/40 text-cyan-300" style={{ clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%)' }}>
            <Orbit className="h-3.5 w-3.5" aria-hidden />
          </div>
          <h2 className="font-mono text-lg font-bold uppercase tracking-tight text-cyan-50">
            Related_Orbit
          </h2>
        </div>
        <span className="inline-flex items-center gap-1.5 border border-cyan-100/18 bg-cyan-950/30 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-cyan-100/70" style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)' }}>
          <span className="h-1 w-1 rounded-full bg-cyan-400/60" />
          {posts.length} Nodes
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {posts.map((p) => (
          <Link
            key={p.slug}
            href={`/posts/${p.slug}`}
            className="group relative flex min-h-36 flex-col gap-2 overflow-hidden border border-cyan-100/14 bg-gradient-to-br from-cyan-950/30 to-slate-950/50 p-4 transition hover:border-cyan-400/35 hover:shadow-[0_0_20px_rgba(103,232,249,0.12)]"
            style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%)' }}
          >
            {/* Corner accent */}
            <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-px w-12 bg-gradient-to-l from-cyan-400/50 to-transparent" />
            <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-12 w-px bg-gradient-to-b from-cyan-400/50 to-transparent" />

            <Orbit className="h-4 w-4 text-cyan-300/70 transition group-hover:text-cyan-300" aria-hidden />
            <p className="line-clamp-2 text-sm font-semibold tracking-tight text-cyan-50 transition group-hover:text-cyan-100">
              {p.frontmatter.title}
            </p>
            {p.frontmatter.description ? (
              <p className="line-clamp-2 text-xs leading-relaxed text-cyan-50/58">
                {p.frontmatter.description}
              </p>
            ) : null}
            <span className="mt-auto flex items-center justify-between gap-2 border-t border-cyan-100/8 pt-2 font-mono text-[10px] uppercase tracking-wider text-cyan-50/48">
              <span>{p.frontmatter.date}</span>
              <span>{p.frontmatter.readingMinutes}m</span>
            </span>
            <ArrowRight className="absolute bottom-4 right-4 h-3.5 w-3.5 text-cyan-100/42 transition group-hover:translate-x-0.5 group-hover:text-cyan-300" aria-hidden />
          </Link>
        ))}
      </div>
    </section>
  );
}
