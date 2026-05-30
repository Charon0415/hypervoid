import Image from "next/image";
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
      <header className="group relative overflow-hidden border border-cyan-100/16 bg-gradient-to-br from-cyan-950/40 to-slate-950/60 p-5 sm:p-7" style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}>
        {/* Corner accents */}
        <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-px w-24 bg-gradient-to-r from-cyan-400/60 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-24 w-px bg-gradient-to-b from-cyan-400/60 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/45 to-transparent" />

        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-cyan-400/70">
            Series_Clusters / Long_Form_Routes
          </p>
        </div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="flex items-center gap-3 font-mono text-3xl font-black uppercase leading-tight tracking-tight text-cyan-50 sm:text-5xl">
            <Layers3 className="h-8 w-8 text-cyan-300/70 sm:h-10 sm:w-10" aria-hidden />
            Series
          </h1>
          <span className="inline-flex items-center gap-1.5 border border-cyan-400/30 bg-cyan-400/15 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-cyan-100" style={{ clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%)' }}>
            <span className="h-1 w-1 rounded-full bg-cyan-400" />
            {series.length} Clusters
          </span>
        </div>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-cyan-50/62">
          围绕同一主题展开的多篇文章，以更长的阅读路径组织。
        </p>
      </header>

      {series.length === 0 ? (
        <p className="border border-dashed border-cyan-100/20 bg-cyan-950/20 p-8 text-center font-mono text-sm uppercase tracking-wider text-cyan-50/60" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
          No_Series_Yet
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {series.map((s) => (
            <Link
              key={s.slug}
              href={`/series/${encodeURIComponent(s.name)}`}
              className="group relative flex min-h-[180px] flex-col justify-end overflow-hidden border border-cyan-100/14 bg-gradient-to-br from-cyan-950/30 to-slate-950/50 p-5 transition hover:border-cyan-400/35 hover:shadow-[0_0_24px_rgba(103,232,249,0.12)]"
              style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%)' }}
            >
              {/* Corner accent */}
              <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-px w-16 bg-gradient-to-l from-cyan-400/50 to-transparent" />
              <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-16 w-px bg-gradient-to-b from-cyan-400/50 to-transparent" />

              {s.cover ? (
                <>
                  <Image
                    src={s.cover}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover opacity-[0.58] saturate-[0.82] transition duration-500 group-hover:scale-105 group-hover:opacity-[0.74] group-hover:saturate-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(103,232,249,.06)_0_1px,transparent_1px_4px)] opacity-[0.12]" />
                </>
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(103,232,249,.16),transparent_35%),linear-gradient(135deg,rgba(255,255,255,.07),transparent)]" />
              )}
              <div className="relative z-10 flex flex-col gap-2">
                <div className="flex items-baseline justify-between gap-3">
                  <h2 className="text-lg font-bold tracking-tight text-cyan-50 transition group-hover:text-cyan-100">
                    {s.name}
                  </h2>
                  <span className="inline-flex shrink-0 items-center gap-1 border border-cyan-100/18 bg-cyan-950/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-cyan-100/70" style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)' }}>
                    {s.count} Posts
                  </span>
                </div>
                {s.description ? (
                  <p className="line-clamp-2 text-sm leading-relaxed text-cyan-50/62">
                    {s.description}
                  </p>
                ) : null}
                <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-cyan-300/70 transition group-hover:text-cyan-300">
                  Open_Route <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" aria-hidden />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
