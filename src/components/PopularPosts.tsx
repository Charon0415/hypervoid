import Link from "next/link";
import { getPopularPosts } from "@/lib/posts";

export async function PopularPosts() {
  const posts = await getPopularPosts(5);
  if (!posts.length) return null;

  const hasViews = posts.some((p) => p.views > 0);

  return (
    <aside className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold tracking-tight text-foreground/80">
        热门文章
      </h3>
      <ol className="mt-3 space-y-2">
        {posts.map((p, i) => (
          <li key={p.slug} className="flex items-baseline gap-2 text-sm">
            <span className="w-4 shrink-0 font-mono text-xs text-muted">
              {i + 1}
            </span>
            <Link
              href={`/posts/${p.slug}`}
              className="line-clamp-2 flex-1 text-foreground transition hover:text-primary"
            >
              {p.title}
            </Link>
            {hasViews ? (
              <span className="shrink-0 font-mono text-[11px] text-muted">
                {p.views}
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </aside>
  );
}
