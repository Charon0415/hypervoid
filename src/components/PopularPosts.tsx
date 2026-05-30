import Link from "next/link";
import { getPopularPosts } from "@/lib/posts";

export async function PopularPosts() {
  const posts = await getPopularPosts(5);
  if (!posts.length) return null;

  const hasViews = posts.some((p) => p.views > 0);

  return (
    <aside className="hv-panel-sci group relative overflow-hidden p-5">
      <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-px w-16 bg-gradient-to-r from-accent/50 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-16 w-px bg-gradient-to-b from-accent/50 to-transparent" />
      <h3 className="font-mono text-xs font-semibold uppercase tracking-widest text-accent">
        热门文章
      </h3>
      <ol className="mt-3 space-y-1.5">
        {posts.map((p, i) => (
          <li key={p.slug}>
            <Link
              href={`/posts/${p.slug}`}
              className="group flex items-center gap-2.5 border border-transparent px-2 py-1.5 transition hover:border-border hover:bg-card"
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center border border-border bg-card font-mono text-[11px] font-medium text-accent">
                {i + 1}
              </span>
              <span className="line-clamp-1 flex-1 text-sm text-muted transition group-hover:text-accent">
                {p.title}
              </span>
              {hasViews ? (
                <span className="shrink-0 font-mono text-[11px] text-muted-soft">
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
