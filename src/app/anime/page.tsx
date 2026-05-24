import type { Metadata } from "next";
import type { BangumiAnime } from "@/lib/bangumi";
import { fetchBangumiAnime } from "@/lib/bangumi";
import { siteConfig } from "@/lib/site-config";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "番剧追番",
  description: `Bangumi 上的追番记录`,
};

export default async function AnimePage() {
  const [watching, done, wish] = await Promise.all([
    fetchBangumiAnime("watching"),
    fetchBangumiAnime("done", { limit: 60 }),
    fetchBangumiAnime("wish", { limit: 30 }),
  ]);

  const empty =
    watching.items.length === 0 &&
    done.items.length === 0 &&
    wish.items.length === 0;

  return (
    <div className="flex flex-col gap-10">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">番剧追番</h1>
        <p className="mt-2 text-sm text-muted">
          在看 {watching.total} · 看过 {done.total} · 想看 {wish.total}
          <span className="mx-2">·</span>
          数据来自{" "}
          <a
            href={`https://bgm.tv/user/${siteConfig.bangumiUserId}/anime`}
            target="_blank"
            rel="noreferrer noopener"
            className="underline hover:text-primary"
          >
            Bangumi @{siteConfig.bangumiUserId}
          </a>
        </p>
      </header>

      {empty ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          ⏳ 还没有追番记录，或 Bangumi 接口暂时不可用。
        </p>
      ) : (
        <>
          <AnimeSection title="🍿 在看" items={watching.items} large />
          <AnimeSection title="✓ 看过" items={done.items} total={done.total} />
          <AnimeSection title="★ 想看" items={wish.items} total={wish.total} />
        </>
      )}
    </div>
  );
}

function AnimeSection({
  title,
  items,
  total,
  large = false,
}: {
  title: string;
  items: BangumiAnime[];
  total?: number;
  large?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight">
        {title}
        <span className="ml-2 text-sm font-normal text-muted">
          {total !== undefined && total > items.length
            ? `${items.length} / ${total}`
            : items.length}
        </span>
      </h2>
      <div
        className={
          large
            ? "grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            : "grid gap-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
        }
      >
        {items.map((item) => (
          <AnimeCard key={item.id} item={item} compact={!large} />
        ))}
      </div>
    </section>
  );
}

function AnimeCard({
  item,
  compact = false,
}: {
  item: BangumiAnime;
  compact?: boolean;
}) {
  const title = item.nameCn || item.name;
  const year = item.date?.slice(0, 4);
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer noopener"
      className="group flex flex-col gap-2 overflow-hidden rounded-xl border border-border bg-card transition hover:border-primary/40 hover:shadow-md"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-background">
        {item.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.cover}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition group-hover:scale-[1.03]"
          />
        ) : (
          <div className="grid h-full place-items-center text-xs text-muted">
            无封面
          </div>
        )}
        {item.myRating > 0 ? (
          <span className="absolute right-1.5 top-1.5 inline-flex items-center gap-0.5 rounded-md bg-black/70 px-1.5 py-0.5 text-[10px] font-mono text-white backdrop-blur">
            ★ {item.myRating}
          </span>
        ) : null}
      </div>
      <div
        className={`flex flex-col ${compact ? "px-2 pb-2" : "px-3 pb-3"}`}
      >
        <p
          className={`line-clamp-2 font-medium leading-snug transition group-hover:text-primary ${
            compact ? "text-xs" : "text-sm"
          }`}
          title={item.name}
        >
          {title}
        </p>
        <p className="mt-1 flex items-center justify-between gap-1 text-[10px] text-muted">
          {year ? <span className="font-mono">{year}</span> : <span />}
          {item.bgmScore ? (
            <span className="font-mono">bgm {item.bgmScore.toFixed(1)}</span>
          ) : null}
        </p>
      </div>
    </a>
  );
}
