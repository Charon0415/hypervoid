import Link from "next/link";
import { getPopularPosts } from "@/lib/posts";

export async function PopularPosts() {
  const posts = await getPopularPosts(5);
  if (!posts.length) return null;

  const hasViews = posts.some((p) => p.views > 0);

  return (
    <aside className="rounded-2xl border border-border bg-card p-4 sm:p-5">
      <h3 className="text-xs font-semibold tracking-tight text-foreground/80">
        热门文章
      </h3>
      <ol className="mt-3 space-y-1.5">
        {posts.map((p, i) => (
          <li key={p.slug}>
            <Link
              href={`/posts/${p.slug}`}
              className="group flex items-center gap-2 rounded-lg px-1.5 py-1 transition hover:bg-primary/5"
            >
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 font-mono text-[10px] font-medium text-primary">
                {i + 1}
              </span>
              <span className="line-clamp-1 flex-1 text-xs text-foreground transition group-hover:text-primary">
                {p.title}
              </span>
              {hasViews ? (
                <span className="shrink-0 font-mono text-[10px] text-muted">
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
