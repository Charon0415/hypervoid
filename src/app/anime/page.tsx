import type { Metadata } from "next";
import { fetchBangumiAnime } from "@/lib/bangumi";
import { siteConfig } from "@/lib/site-config";
import { AnimeGrid } from "@/components/AnimeGrid";

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
          {watching.items.length > 0 ? (
            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold tracking-tight">
                🍿 在看
                <span className="ml-2 text-sm font-normal text-muted">
                  {watching.items.length}
                </span>
              </h2>
              <AnimeGrid items={watching.items} large />
            </section>
          ) : null}

          {done.items.length > 0 ? (
            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold tracking-tight">
                ✓ 看过
                <span className="ml-2 text-sm font-normal text-muted">
                  {done.total > done.items.length
                    ? `${done.items.length} / ${done.total}`
                    : done.items.length}
                </span>
              </h2>
              <AnimeGrid items={done.items} />
            </section>
          ) : null}

          {wish.items.length > 0 ? (
            <section className="flex flex-col gap-4">
              <h2 className="text-xl font-semibold tracking-tight">
                ★ 想看
                <span className="ml-2 text-sm font-normal text-muted">
                  {wish.total > wish.items.length
                    ? `${wish.items.length} / ${wish.total}`
                    : wish.items.length}
                </span>
              </h2>
              <AnimeGrid items={wish.items} />
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
