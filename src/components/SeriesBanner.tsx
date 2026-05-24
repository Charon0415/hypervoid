import Link from "next/link";
import type { Post } from "@/lib/posts";
import { getPostsBySeries } from "@/lib/posts";

export async function SeriesBanner({ post }: { post: Post }) {
  const seriesName = post.frontmatter.series;
  if (!seriesName) return null;

  const seriesPosts = await getPostsBySeries(seriesName);
  if (seriesPosts.length <= 1) return null;

  const currentIndex = seriesPosts.findIndex((p) => p.slug === post.slug);
  const position = currentIndex >= 0 ? currentIndex + 1 : 1;

  return (
    <aside className="mt-6 overflow-hidden rounded-2xl border border-primary/20 bg-primary/5">
      <Link
        href={`/series/${encodeURIComponent(seriesName)}`}
        className="block px-4 py-3 transition hover:bg-primary/10"
      >
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-medium text-primary">
            ✦ 本文是「{seriesName}」系列的第 {position} 篇 / 共 {seriesPosts.length} 篇
          </span>
          <span className="font-mono text-muted">查看全部 →</span>
        </div>
      </Link>
      <ol className="border-t border-primary/10 px-4 py-3">
        <div className="flex flex-col gap-1.5 text-sm">
          {seriesPosts.map((p, i) => {
            const isCurrent = p.slug === post.slug;
            return (
              <Link
                key={p.slug}
                href={`/posts/${p.slug}`}
                className={`flex items-baseline gap-2 rounded-md px-2 py-1 transition ${
                  isCurrent
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <span className="shrink-0 font-mono text-xs opacity-70">
                  {String(p.frontmatter.seriesOrder ?? i + 1).padStart(2, "0")}
                </span>
                <span className="line-clamp-1 flex-1">
                  {p.frontmatter.title}
                </span>
                {isCurrent ? (
                  <span className="shrink-0 text-[10px] uppercase tracking-wider">
                    当前
                  </span>
                ) : null}
              </Link>
            );
          })}
        </div>
      </ol>
    </aside>
  );
}
