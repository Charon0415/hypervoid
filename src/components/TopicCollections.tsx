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
          <div className="grid h-8 w-8 place-items-center border border-cyan-100/18 bg-cyan-50/[0.055] text-cyan-100">
            <Layers3 className="h-4 w-4" aria-hidden />
          </div>
          <h2 className="hv-title text-xl font-bold tracking-tight sm:text-2xl">
            专题合集
          </h2>
        </div>
        <Link href="/series" className="hv-action min-h-8 px-3 text-sm font-medium">
          全部专题
          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {series[0] && (
          <Link
            href={"/series/" + encodeURIComponent(series[0].name)}
            className="hv-panel hv-panel-hover group relative col-span-2 row-span-2 flex flex-col justify-end overflow-hidden p-0 sm:min-h-[220px]"
          >
            {series[0].cover ? (
              <>
                <img src={series[0].cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-[0.58] saturate-[0.82] transition duration-500 group-hover:scale-105 group-hover:opacity-[0.74] group-hover:saturate-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
              </>
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(103,232,249,.16),transparent_35%),linear-gradient(135deg,rgba(255,255,255,.07),transparent)]" />
            )}
            <div className="relative z-10 flex flex-col gap-2 p-5 sm:p-6">
              <span className="hv-chip hv-chip-strong w-fit">精选</span>
              <h3 className="hv-title text-xl font-bold tracking-tight transition group-hover:text-cyan-100 sm:text-2xl">
                {series[0].name}
              </h3>
              {series[0].description ? <p className="line-clamp-2 text-sm text-cyan-50/62">{series[0].description}</p> : null}
              <span className="font-mono text-xs text-cyan-50/50">{series[0].count} 篇文章</span>
            </div>
          </Link>
        )}

        {series.slice(1).map((s) => (
          <Link
            key={s.slug}
            href={"/series/" + encodeURIComponent(s.name)}
            className="hv-panel hv-panel-hover group relative flex flex-col justify-end overflow-hidden p-0 sm:min-h-[106px]"
          >
            {s.cover ? (
              <>
                <img src={s.cover} alt="" className="absolute inset-0 h-full w-full object-cover opacity-[0.55] saturate-[0.82] transition duration-500 group-hover:scale-105 group-hover:opacity-[0.72]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/20 to-transparent" />
              </>
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(103,232,249,.13),transparent_42%),linear-gradient(135deg,rgba(255,255,255,.06),transparent)]" />
            )}
            <div className="relative z-10 flex flex-col gap-1 p-4">
              <h3 className="text-sm font-semibold tracking-tight text-cyan-50 transition group-hover:text-cyan-100">{s.name}</h3>
              <span className="font-mono text-[11px] text-cyan-50/50">{s.count} 篇</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
