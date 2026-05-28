import Link from "next/link";
import { getPublicSeriesList } from "@/lib/series-public";

export async function TopicCollections() {
  const series = await getPublicSeriesList();
  if (!series.length) return null;

  return (
    <section>
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
          专题合集
        </h2>
        <Link
          href="/series"
          className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground/80 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
        >
          全部专题
          <svg
            aria-hidden
            className="h-3.5 w-3.5 transition group-hover:translate-x-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {series.map((s) => (
          <Link
            key={s.slug}
            href={`/series/${encodeURIComponent(s.name)}`}
            className="group relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-border bg-card p-5 transition hover:border-primary/40 hover:shadow-md"
          >
            {s.cover ? (
              <div className="relative -mx-5 -mt-5 mb-1 aspect-[2/1] overflow-hidden">
                <img
                  src={s.cover}
                  alt=""
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
              </div>
            ) : null}
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-base font-semibold tracking-tight transition group-hover:text-primary">
                {s.name}
              </h3>
              <span className="shrink-0 font-mono text-xs text-muted">
                {s.count} 篇
              </span>
            </div>
            {s.description ? (
              <p className="line-clamp-2 text-sm text-muted">{s.description}</p>
            ) : null}
            <span className="mt-auto text-xs text-primary opacity-0 transition group-hover:opacity-100">
              查看系列 →
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
