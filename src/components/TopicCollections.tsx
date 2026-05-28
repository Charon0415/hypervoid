import Link from "next/link";
import { getPublicSeriesList } from "@/lib/series-public";

function hashHue(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++)
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h % 360);
}

export async function TopicCollections() {
  const series = await getPublicSeriesList();
  if (!series.length) return null;

  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary/10 text-sm text-primary">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            </svg>
          </div>
          <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
            专题合集
          </h2>
        </div>
        <Link
          href="/series"
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-muted transition hover:text-primary"
        >
          全部专题
          <svg
            aria-hidden
            className="h-3.5 w-3.5 transition group-hover:translate-x-1"
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

      {/* Featured first + bento grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Featured: first series spans 2 cols */}
        {series[0] && (
          <Link
            href={`/series/${encodeURIComponent(series[0].name)}`}
            className="group relative col-span-2 row-span-2 flex flex-col justify-end overflow-hidden rounded-2xl border border-border transition hover:border-primary/40 hover:shadow-lg sm:min-h-[220px]"
            style={{
              background: series[0].cover
                ? undefined
                : `linear-gradient(135deg, hsl(${hashHue(series[0].name)}, 60%, 95%) 0%, hsl(${hashHue(series[0].name) + 30}, 50%, 88%) 100%)`,
            }}
          >
            {series[0].cover ? (
              <>
                <img
                  src={series[0].cover}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-t from-card/90 to-transparent" />
            )}
            <div className="relative z-10 flex flex-col gap-2 p-5 sm:p-6">
              <span className="w-fit rounded-full bg-primary/90 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground">
                精选
              </span>
              <h3 className="text-xl font-bold tracking-tight text-foreground transition group-hover:text-primary sm:text-2xl">
                {series[0].name}
              </h3>
              {series[0].description ? (
                <p className="line-clamp-2 text-sm text-muted">
                  {series[0].description}
                </p>
              ) : null}
              <span className="font-mono text-xs text-muted">
                {series[0].count} 篇文章
              </span>
            </div>
          </Link>
        )}

        {/* Rest of the series */}
        {series.slice(1).map((s) => {
          const hue = hashHue(s.name);
          return (
            <Link
              key={s.slug}
              href={`/series/${encodeURIComponent(s.name)}`}
              className="group relative flex flex-col justify-end overflow-hidden rounded-2xl border border-border transition hover:border-primary/40 hover:shadow-md sm:min-h-[106px]"
              style={{
                background: s.cover
                  ? undefined
                  : `linear-gradient(160deg, hsl(${hue}, 55%, 94%) 0%, hsl(${hue + 20}, 45%, 90%) 100%)`,
              }}
            >
              {s.cover ? (
                <>
                  <img
                    src={s.cover}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                </>
              ) : null}
              <div className="relative z-10 flex flex-col gap-1 p-4">
                <h3 className="text-sm font-semibold tracking-tight text-foreground transition group-hover:text-primary">
                  {s.name}
                </h3>
                <span className="font-mono text-[11px] text-muted">
                  {s.count} 篇
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
