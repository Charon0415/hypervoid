import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { PostCard } from "@/components/PostCard";
import { SearchBox } from "@/components/SearchBox";
import { searchPosts, getAllTags } from "@/lib/posts";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "搜索",
  description: "搜索文章",
  robots: { index: false, follow: false },
};

type SearchParams = { q?: string; tag?: string; year?: string };

function buildHref(base: SearchParams, override: Partial<SearchParams>): string {
  const next: SearchParams = { ...base, ...override };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.tag) params.set("tag", next.tag);
  if (next.year) params.set("year", next.year);
  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}

export default async function SearchPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const raw = await props.searchParams;
  const query = (raw.q ?? "").trim();
  const tag = (raw.tag ?? "").trim();
  const year = (raw.year ?? "").trim();
  const params: SearchParams = { q: query || undefined, tag: tag || undefined, year: year || undefined };

  const [hits, allTags] = await Promise.all([
    query ? searchPosts(query, { tag: tag || undefined, year: year || undefined }) : Promise.resolve([]),
    getAllTags(),
  ]);

  // Determine which tags/years are present in the hits for chip rendering
  const tagsInHits = new Map<string, number>();
  const yearsInHits = new Map<string, number>();
  // For tag/year chips, we want options BEFORE filtering, so query without filters
  const baseHits = query
    ? await searchPosts(query, {})
    : [];
  for (const h of baseHits) {
    for (const t of h.frontmatter.tags) {
      tagsInHits.set(t, (tagsInHits.get(t) ?? 0) + 1);
    }
    const y = h.frontmatter.date.slice(0, 4);
    yearsInHits.set(y, (yearsInHits.get(y) ?? 0) + 1);
  }

  const sortedTagChips = [...tagsInHits.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  const sortedYearChips = [...yearsInHits.entries()].sort((a, b) =>
    a[0] < b[0] ? 1 : -1,
  );
  const activeFilters = (tag ? 1 : 0) + (year ? 1 : 0);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground/80 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
          >
            <svg
              aria-hidden
              className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>
            首页
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">搜索</h1>
          <span className="text-xs text-muted">
            共 {allTags.length} 个标签
          </span>
        </div>
        <Suspense fallback={null}>
          <SearchBox initial={query} />
        </Suspense>
      </header>

      {query && (sortedTagChips.length > 0 || sortedYearChips.length > 0) ? (
        <section className="flex flex-col gap-2.5">
          {sortedTagChips.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-muted">标签：</span>
              <Link
                href={buildHref(params, { tag: undefined })}
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 transition ${
                  !tag
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted hover:border-primary/40 hover:text-foreground"
                }`}
              >
                全部
              </Link>
              {sortedTagChips.map(([name, n]) => {
                const active = tag === name;
                return (
                  <Link
                    key={name}
                    href={buildHref(params, { tag: active ? undefined : name })}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 transition ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    #{name}
                    <span className="font-mono text-[10px] opacity-70">
                      {n}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : null}
          {sortedYearChips.length > 1 ? (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-muted">年份：</span>
              <Link
                href={buildHref(params, { year: undefined })}
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 transition ${
                  !year
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-muted hover:border-primary/40 hover:text-foreground"
                }`}
              >
                全部
              </Link>
              {sortedYearChips.map(([y, n]) => {
                const active = year === y;
                return (
                  <Link
                    key={y}
                    href={buildHref(params, { year: active ? undefined : y })}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 transition ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-card text-muted hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {y}
                    <span className="font-mono text-[10px] opacity-70">
                      {n}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : null}
        </section>
      ) : null}

      {!query ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          输入关键词开始搜索（支持中文）。
        </p>
      ) : hits.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          没有匹配「<span className="text-foreground">{query}</span>」
          {activeFilters > 0 ? "且符合所选过滤的" : "的"}文章。
        </p>
      ) : (
        <>
          <p className="text-sm text-muted">
            找到 {hits.length} 篇匹配「
            <span className="text-foreground">{query}</span>」的文章
            {tag ? (
              <>
                {" "}
                · 标签 <span className="text-primary">#{tag}</span>
              </>
            ) : null}
            {year ? (
              <>
                {" "}
                · 年份 <span className="text-primary">{year}</span>
              </>
            ) : null}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {hits.map((hit) => (
              <PostCard key={hit.slug} post={hit} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
