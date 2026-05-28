import Link from "next/link";
import type { Metadata } from "next";
import { getPublicSeriesList } from "@/lib/series-public";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "专题合集",
  description: "围绕同一主题的系列文章",
};

function hashHue(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++)
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  return Math.abs(h % 360);
}

export default async function SeriesIndexPage() {
  const series = await getPublicSeriesList();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">专题合集</h1>
        <p className="mt-2 text-sm text-muted">
          围绕同一主题展开的多篇文章
        </p>
      </header>

      {series.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          还没有任何系列。在后台编辑文章时填写「所属系列」字段就会出现在这里。
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {series.map((s) => {
            const hue = hashHue(s.name);
            return (
              <Link
                key={s.slug}
                href={`/series/${encodeURIComponent(s.name)}`}
                className="group relative flex flex-col justify-end overflow-hidden rounded-2xl border border-border transition hover:border-primary/40 hover:shadow-lg sm:min-h-[180px]"
                style={{
                  background: s.cover
                    ? undefined
                    : `linear-gradient(135deg, hsl(${hue}, 60%, 95%) 0%, hsl(${hue + 30}, 50%, 88%) 100%)`,
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
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
                )}
                <div className="relative z-10 flex flex-col gap-2 p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 className="text-lg font-bold tracking-tight text-foreground transition group-hover:text-primary">
                      {s.name}
                    </h2>
                    <span className="shrink-0 font-mono text-xs text-muted">
                      {s.count} 篇
                    </span>
                  </div>
                  {s.description ? (
                    <p className="line-clamp-2 text-sm text-muted">
                      {s.description}
                    </p>
                  ) : null}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
