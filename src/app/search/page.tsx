import { Suspense } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { SearchHitCard } from "@/components/SearchHitCard";
import { SearchBox } from "@/components/SearchBox";
import { searchPosts, getAllTags } from "@/lib/posts";
import { logSearchQuery } from "@/db/search-log";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "搜索",
  description: "搜索文章",
  robots: { index: false, follow: false },
};

type SearchParams = {
  q?: string;
  tag?: string;
  tags?: string | string[];
  year?: string;
  from?: string;
  to?: string;
};

type ParsedParams = {
  q?: string;
  tags: string[];
  from?: string;
  to?: string;
  year?: string;
};

function parseTags(value: SearchParams["tags"]): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap((v) => v.split(",")).map((s) => s.trim()).filter(Boolean);
  return value.split(",").map((s) => s.trim()).filter(Boolean);
}

function buildHref(params: ParsedParams): string {
  const url = new URLSearchParams();
  if (params.q) url.set("q", params.q);
  for (const t of params.tags) url.append("tags", t);
  if (params.from) url.set("from", params.from);
  if (params.to) url.set("to", params.to);
  if (params.year) url.set("year", params.year);
  const qs = url.toString();
  return qs ? `/search?${qs}` : "/search";
}

function toggleTag(params: ParsedParams, name: string): ParsedParams {
  const tags = params.tags.includes(name)
    ? params.tags.filter((t) => t !== name)
    : [...params.tags, name];
  return { ...params, tags };
}

export default async function SearchPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const raw = await props.searchParams;
  const params: ParsedParams = {
    q: raw.q?.trim() || undefined,
    tags: [...new Set([...(raw.tag ? [raw.tag.trim()] : []), ...parseTags(raw.tags)])].filter(Boolean),
    from: raw.from?.trim() || undefined,
    to: raw.to?.trim() || undefined,
    year: raw.year?.trim() || undefined,
  };

  const [hits, allTags] = await Promise.all([
    params.q
      ? searchPosts(params.q, {
          tags: params.tags,
          from: params.from,
          to: params.to,
          year: params.year,
        })
      : Promise.resolve([]),
    getAllTags(),
  ]);

  if (params.q) {
    const h = await headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      h.get("x-real-ip") ??
      null;
    // Best-effort, never awaited blocking the response render.
    void logSearchQuery({ query: params.q, resultCount: hits.length, ip });
  }

  // Chips reflect what the base query *could* match — compute pre-filter set
  const baseHits = params.q ? await searchPosts(params.q, {}) : [];
  const tagsInHits = new Map<string, number>();
  const yearsInHits = new Map<string, number>();
  for (const h of baseHits) {
    for (const t of h.frontmatter.tags) {
      tagsInHits.set(t, (tagsInHits.get(t) ?? 0) + 1);
    }
    yearsInHits.set(
      h.frontmatter.date.slice(0, 4),
      (yearsInHits.get(h.frontmatter.date.slice(0, 4)) ?? 0) + 1,
    );
  }

  const sortedTagChips = [...tagsInHits.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 14);

  const activeFilters =
    params.tags.length +
    (params.from ? 1 : 0) +
    (params.to ? 1 : 0) +
    (params.year ? 1 : 0);

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
          <span className="text-xs text-muted">共 {allTags.length} 个标签</span>
        </div>
        <Suspense fallback={null}>
          <SearchBox initial={params.q ?? ""} />
        </Suspense>
      </header>

      {params.q ? (
        <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
          {/* Date range */}
          <form
            method="GET"
            action="/search"
            className="flex flex-wrap items-center gap-2 text-xs"
          >
            <input type="hidden" name="q" value={params.q} />
            {params.tags.map((t) => (
              <input key={t} type="hidden" name="tags" value={t} />
            ))}
            <span className="text-muted">日期：</span>
            <input
              type="date"
              name="from"
              defaultValue={params.from ?? ""}
              className="rounded-md border border-border bg-background px-2 py-1 text-xs"
            />
            <span className="text-muted">→</span>
            <input
              type="date"
              name="to"
              defaultValue={params.to ?? ""}
              className="rounded-md border border-border bg-background px-2 py-1 text-xs"
            />
            <button
              type="submit"
              className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground transition hover:opacity-90"
            >
              应用
            </button>
            {(params.from || params.to) && (
              <Link
                href={buildHref({ ...params, from: undefined, to: undefined })}
                className="text-muted hover:text-primary"
              >
                清除日期
              </Link>
            )}
          </form>

          {/* Tag chips (multi-select) */}
          {sortedTagChips.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-muted">标签：</span>
              {sortedTagChips.map(([name, n]) => {
                const active = params.tags.includes(name);
                return (
                  <Link
                    key={name}
                    href={buildHref(toggleTag(params, name))}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 transition ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-background text-muted hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    #{name}
                    <span className="font-mono text-[10px] opacity-70">{n}</span>
                  </Link>
                );
              })}
              {params.tags.length > 1 ? (
                <Link
                  href={buildHref({ ...params, tags: [] })}
                  className="text-muted hover:text-primary"
                >
                  清除标签
                </Link>
              ) : null}
            </div>
          ) : null}

          {activeFilters > 0 ? (
            <p className="text-[10px] text-muted">
              已应用 <span className="text-foreground">{activeFilters}</span> 个过滤条件 · 多个标签为交集匹配。
            </p>
          ) : null}
        </section>
      ) : null}

      {!params.q ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          输入关键词开始搜索（支持中文）。
        </p>
      ) : hits.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          没有匹配「<span className="text-foreground">{params.q}</span>」
          {activeFilters > 0 ? "且符合所选过滤的" : "的"}文章。
        </p>
      ) : (
        <>
          <p className="text-sm text-muted">
            找到 {hits.length} 篇匹配「
            <span className="text-foreground">{params.q}</span>」
            {params.tags.length > 0 ? (
              <>
                {" "}
                · 标签{" "}
                {params.tags.map((t) => (
                  <span key={t} className="ml-0.5 text-primary">
                    #{t}
                  </span>
                ))}
              </>
            ) : null}
            {params.from || params.to ? (
              <>
                {" "}
                · 日期{" "}
                <span className="text-primary">
                  {params.from || "…"} → {params.to || "…"}
                </span>
              </>
            ) : null}
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {hits.map((hit) => (
              <SearchHitCard key={hit.slug} post={hit} query={params.q ?? ""} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
