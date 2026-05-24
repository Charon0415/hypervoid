import Link from "next/link";
import type { Metadata } from "next";
import { getAllSeries } from "@/lib/posts";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "文章系列",
  description: "围绕同一主题的系列文章",
};

export default async function SeriesIndexPage() {
  const series = await getAllSeries();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">文章系列</h1>
        <p className="mt-2 text-sm text-muted">
          围绕同一主题展开的多篇文章
        </p>
      </header>

      {series.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          还没有任何系列。在后台编辑文章时填写「所属系列」字段就会出现这里。
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {series.map((s) => (
            <Link
              key={s.name}
              href={`/series/${encodeURIComponent(s.name)}`}
              className="group flex flex-col gap-2 rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="text-lg font-semibold tracking-tight transition group-hover:text-primary">
                  ✦ {s.name}
                </h2>
                <span className="shrink-0 font-mono text-xs text-muted">
                  {s.count} 篇
                </span>
              </div>
              <p className="text-xs text-muted">
                最近更新 · {s.latestDate}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
