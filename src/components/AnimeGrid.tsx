"use client";

import { useState } from "react";
import type { BangumiAnime } from "@/lib/bangumi";
import { AnimeDetailModal } from "@/components/AnimeDetailModal";

export function AnimeGrid({
  items,
  large = false,
}: {
  items: BangumiAnime[];
  large?: boolean;
}) {
  const [selected, setSelected] = useState<BangumiAnime | null>(null);

  return (
    <>
      <div
        className={
          large
            ? "grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            : "grid gap-3 grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6"
        }
      >
        {items.map((item) => (
          <AnimeCard
            key={item.id}
            item={item}
            compact={!large}
            onClick={() => setSelected(item)}
          />
        ))}
      </div>
      {selected ? (
        <AnimeDetailModal
          item={selected}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </>
  );
}

function AnimeCard({
  item,
  compact,
  onClick,
}: {
  item: BangumiAnime;
  compact: boolean;
  onClick: () => void;
}) {
  const title = item.nameCn || item.name;
  const year = item.date?.slice(0, 4);
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col gap-2 overflow-hidden rounded-xl border border-border bg-card text-left transition hover:border-primary/40 hover:shadow-md"
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
      <div className={`flex flex-col ${compact ? "px-2 pb-2" : "px-3 pb-3"}`}>
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
    </button>
  );
}
