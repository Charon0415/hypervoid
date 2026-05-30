import Link from "next/link";
import { ArrowRight, Layers3 } from "lucide-react";
import { getPublicSeriesList } from "@/lib/series-public";

export async function TopicCollections() {
  const series = (await getPublicSeriesList()).slice(0, 5);
  if (!series.length) return null;

  return (
    <section>
      <div className="mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center border border-cyan-400/30 bg-cyan-950/40 text-cyan-300" style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)' }}>
            <Layers3 className="h-4 w-4" aria-hidden />
          </div>
          <h2 className="font-mono text-xl font-bold uppercase tracking-tight text-cyan-50 sm:text-2xl">
            Topic_Series
          </h2>
        </div>
        <Link href="/series" className="hv-action-compact group inline-flex items-center gap-1.5 border border-cyan-100/18 bg-cyan-950/30 px-3 py-1.5 font-mono text-xs font-medium uppercase tracking-wider text-cyan-100/80 transition hover:border-cyan-400/40 hover:bg-cyan-900/40 hover:text-cyan-300">
          View_All
          <ArrowRight className="h-3 w-3 transition group-hover:translate-x-0.5" aria-hidden />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {series[0] && (
          <Link
            href={"/series/" + encodeURIComponent(series[0].name)}
            className="group relative col-span-2 row-span-2 flex flex-col justify-end overflow-hidden border border-cyan-100/16 bg-gradient-to-br from-cyan-950/40 to-slate-950/60 p-0 transition hover:border-cyan-400/40 hover:shadow-[0_0_32px_rgba(103,232,249,0.15)] sm:min-h-[220px]"
            style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))' }}
          >
            {/* Corner indicators */}
            <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-px w-20 bg-gradient-to-r from-cyan-400/70 to-transparent" />
            <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-20 w-px bg-gradient-to-b from-cyan-400/70 to-transparent" />
            <div aria-hidden className="pointer-events-none absolute bottom-0 right-0 h-px w-20 bg-gradient-to-l from-cyan-400/50 to-transparent" />

            {series[0].cover ? (
              <>
                <img src={series[0].cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-[0.58] saturate-[0.82] transition duration-500 group-hover:scale-105 group-hover:opacity-[0.74] group-hover:saturate-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(103,232,249,.08)_0_1px,transparent_1px_4px)] opacity-[0.15]" />
              </>
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(103,232,249,.16),transparent_35%),linear-gradient(135deg,rgba(255,255,255,.07),transparent)]" />
            )}
            <div className="relative z-10 flex flex-col gap-2 p-5 sm:p-6">
              <span className="hv-chip-sci w-fit">
                <span className="font-mono text-[10px] font-bold uppercase tracking-wider">Featured</span>
              </span>
              <h3 className="text-xl font-bold tracking-tight text-cyan-50 transition group-hover:text-cyan-100 sm:text-2xl">
                {series[0].name}
              </h3>
              {series[0].description ? <p className="line-clamp-2 text-sm text-cyan-50/62">{series[0].description}</p> : null}
              <div className="flex items-center gap-2 font-mono text-xs text-cyan-50/50">
                <span className="h-1 w-1 rounded-full bg-cyan-400/60" />
                <span className="uppercase tracking-wider">{series[0].count} Articles</span>
              </div>
            </div>
          </Link>
        )}

        {series.slice(1).map((s) => (
          <Link
            key={s.slug}
            href={"/series/" + encodeURIComponent(s.name)}
            className="group relative flex flex-col justify-end overflow-hidden border border-cyan-100/14 bg-gradient-to-br from-cyan-950/30 to-slate-950/50 p-0 transition hover:border-cyan-400/35 hover:shadow-[0_0_24px_rgba(103,232,249,0.12)] sm:min-h-[106px]"
            style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}
          >
            {/* Top corner accent */}
            <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-px w-12 bg-gradient-to-l from-cyan-400/50 to-transparent" />
            <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-12 w-px bg-gradient-to-b from-cyan-400/50 to-transparent" />

            {s.cover ? (
              <>
                <img src={s.cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-[0.55] saturate-[0.82] transition duration-500 group-hover:scale-105 group-hover:opacity-[0.72]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(103,232,249,.06)_0_1px,transparent_1px_4px)] opacity-[0.12]" />
              </>
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(103,232,249,.13),transparent_42%),linear-gradient(135deg,rgba(255,255,255,.06),transparent)]" />
            )}
            <div className="relative z-10 flex flex-col gap-1 p-4">
              <h3 className="text-sm font-semibold tracking-tight text-cyan-50 transition group-hover:text-cyan-100">{s.name}</h3>
              <div className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-cyan-50/50">
                <span className="h-1 w-1 rounded-full bg-cyan-400/50" />
                {s.count} Articles
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
