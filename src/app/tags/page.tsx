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
      <header className="hv-panel relative overflow-hidden p-5 sm:p-7">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/45 to-transparent" />
        <p className="hv-kicker">Tag matrix / topic channels</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="hv-title flex items-center gap-3 text-3xl font-black leading-tight sm:text-5xl">
            <Tags className="h-8 w-8 text-cyan-100/70 sm:h-10 sm:w-10" aria-hidden />
            所有标签
          </h1>
          <span className="hv-chip hv-chip-strong">{tags.length} channels</span>
        </div>
      </header>
      {tags.length ? (
        <div className="flex flex-wrap gap-2">
          {tags.map(({ tag, count }) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="hv-chip group gap-2 px-3.5 py-2 text-sm transition hover:border-cyan-100/45 hover:bg-cyan-100/12 hover:text-cyan-50"
            >
              <Hash className="h-3.5 w-3.5 text-cyan-100/70" aria-hidden />
              <span>{tag}</span>
              <span className="border-l border-cyan-100/18 pl-2 font-mono text-[10px] text-cyan-50/55">
                {count}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="hv-panel border-dashed p-8 text-center text-cyan-50/60">
          还没有标签。
        </p>
      )}
    </div>
  );
}
