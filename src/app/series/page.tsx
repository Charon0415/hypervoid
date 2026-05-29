import Link from "next/link";
import { ArrowRight, Layers3 } from "lucide-react";
import type { Metadata } from "next";
import { getPublicSeriesList } from "@/lib/series-public";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "专题合集",
  description: "围绕同一主题的系列文章",
};

export default async function SeriesIndexPage() {
  const series = await getPublicSeriesList();

  return (
    <div className="flex flex-col gap-6">
      <header className="hv-panel relative overflow-hidden p-5 sm:p-7">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/45 to-transparent" />
        <p className="hv-kicker">Series clusters / long-form routes</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="hv-title flex items-center gap-3 text-3xl font-black leading-tight sm:text-5xl">
            <Layers3 className="h-8 w-8 text-cyan-100/70 sm:h-10 sm:w-10" aria-hidden />
            专题合集
          </h1>
          <span className="hv-chip hv-chip-strong">{series.length} clusters</span>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-cyan-50/62">
          围绕同一主题展开的多篇文章，以更长的阅读路径组织。
        </p>
      </header>

      {series.length === 0 ? (
        <p className="hv-panel border-dashed p-8 text-center text-cyan-50/60">
          还没有任何系列。在后台编辑文章时填写「所属系列」字段就会出现在这里。
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {series.map((s) => (
            <Link
              key={s.slug}
              href={`/series/${encodeURIComponent(s.name)}`}
              className="hv-panel hv-panel-hover group relative flex min-h-[180px] flex-col justify-end overflow-hidden p-5"
            >
              {s.cover ? (
                <>
                  <img
                    src={s.cover}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover opacity-[0.58] saturate-[0.82] transition duration-500 group-hover:scale-105 group-hover:opacity-[0.74] group-hover:saturate-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                </>
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(103,232,249,.16),transparent_35%),linear-gradient(135deg,rgba(255,255,255,.07),transparent)]" />
              )}
              <div className="relative z-10 flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="hv-title text-lg font-bold tracking-tight transition group-hover:text-cyan-100">
                    {s.name}
                  </h2>
                  <span className="hv-chip shrink-0">{s.count} 篇</span>
                </div>
                {s.description ? (
                  <p className="line-clamp-2 text-sm leading-relaxed text-cyan-50/62">
                    {s.description}
                  </p>
                ) : null}
                <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase text-cyan-100/58">
                  Open route <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" aria-hidden />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
