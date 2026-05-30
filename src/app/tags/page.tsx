import Link from "next/link";
import { Hash, Tags } from "lucide-react";
import type { Metadata } from "next";
import { getAllTags } from "@/lib/posts";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "标签",
  description: "按标签浏览所有文章",
};

export default async function TagsIndex() {
  const tags = await getAllTags();
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
            Tag_Matrix / Topic_Channels
          </p>
        </div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="flex items-center gap-3 font-mono text-3xl font-black uppercase leading-tight tracking-tight text-cyan-50 sm:text-5xl">
            <Tags className="h-8 w-8 text-cyan-300/70 sm:h-10 sm:w-10" aria-hidden />
            All_Tags
          </h1>
          <span className="inline-flex items-center gap-1.5 border border-cyan-400/30 bg-cyan-400/15 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-cyan-100" style={{ clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%)' }}>
            <span className="h-1 w-1 rounded-full bg-cyan-400" />
            {tags.length} Channels
          </span>
        </div>
      </header>
      {tags.length ? (
        <div className="flex flex-wrap gap-2">
          {tags.map(({ tag, count }) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="group inline-flex items-center gap-2 border border-cyan-100/16 bg-gradient-to-br from-cyan-950/30 to-transparent px-3.5 py-2 text-sm transition hover:border-cyan-400/40 hover:bg-cyan-900/30 hover:text-cyan-100 hover:shadow-[0_0_16px_rgba(103,232,249,0.12)]"
              style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)' }}
            >
              <Hash className="h-3.5 w-3.5 text-cyan-300/70 transition group-hover:text-cyan-300" aria-hidden />
              <span className="font-mono text-cyan-50/80 transition group-hover:text-cyan-100">{tag}</span>
              <span className="border-l border-cyan-100/18 pl-2 font-mono text-[10px] uppercase tracking-wider text-cyan-50/55">
                {count}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="border border-dashed border-cyan-100/20 bg-cyan-950/20 p-8 text-center font-mono text-sm uppercase tracking-wider text-cyan-50/60" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
          No_Tags_Yet
        </p>
      )}
    </div>
  );
}
