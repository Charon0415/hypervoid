import Link from "next/link";
import { getPopularPosts } from "@/lib/posts";

export async function PopularPosts() {
  const posts = await getPopularPosts(5);
  if (!posts.length) return null;

  const hasViews = posts.some((p) => p.views > 0);

  return (
    <aside className="hv-panel-sci group relative overflow-hidden p-5">
      <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-px w-16 bg-gradient-to-r from-cyan-400/50 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-16 w-px bg-gradient-to-b from-cyan-400/50 to-transparent" />
      <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-cyan-100/80">
        热门文章
      </h3>
      <ol className="mt-3 space-y-1.5">
        {posts.map((p, i) => (
          <li key={p.slug}>
            <Link
              href={`/posts/${p.slug}`}
              className="group flex items-center gap-2.5 border border-transparent px-2 py-1.5 transition hover:border-cyan-100/18 hover:bg-cyan-950/36"
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center border border-cyan-100/18 bg-cyan-950/36 font-mono text-[11px] font-medium text-cyan-300">
                {i + 1}
              </span>
              <span className="line-clamp-1 flex-1 text-sm text-cyan-50/76 transition group-hover:text-cyan-100">
                {p.title}
              </span>
              {hasViews ? (
                <span className="shrink-0 font-mono text-[11px] text-cyan-50/45">
                  {p.views}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ol>
    </aside>
  );
}
