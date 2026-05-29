import Link from "next/link";
import { Archive, Pin, Radio } from "lucide-react";
import type { Metadata } from "next";
import { getAllPostMeta } from "@/lib/posts";
import { ArchiveLayout } from "@/components/ArchiveLayout";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "归档",
  description: "全部文章按时间线归档",
};

export default async function ArchivePage() {
  const posts = await getAllPostMeta();

  const byYear = new Map<string, typeof posts>();
  for (const post of posts) {
    const year = post.frontmatter.date.slice(0, 4);
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(post);
  }
  const years = [...byYear.keys()].sort((a, b) => (a < b ? 1 : -1));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <header className="hv-panel relative overflow-hidden p-5 sm:p-7">
        <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/45 to-transparent" />
        <p className="hv-kicker">Archive timeline / chronological scan</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h1 className="hv-title flex items-center gap-3 text-3xl font-black leading-tight sm:text-5xl">
            <Archive className="h-8 w-8 text-cyan-100/70 sm:h-10 sm:w-10" aria-hidden />
            归档
          </h1>
          <span className="hv-chip hv-chip-strong">{posts.length} nodes / {years.length} years</span>
        </div>
      </header>
      {years.length === 0 ? (
        <p className="hv-panel border-dashed p-8 text-center text-cyan-50/60">
          还没有文章。
        </p>
      ) : (
        <ArchiveLayout>
          {years.map((year) => {
            const posts = byYear.get(year)!;
            return (
              <section key={year} className="flex flex-col gap-3">
                <h2 className="hv-title flex items-baseline gap-2 text-2xl font-bold">
                  {year}
                  <span className="hv-chip text-xs font-normal">
                    {posts.length} 篇
                  </span>
                </h2>
                <ol className="relative ml-2 space-y-3 border-l border-cyan-100/14 pl-5">
                  {posts.map((post) => (
                    <li key={post.slug} className="relative">
                      <span className="absolute -left-[26px] mt-2 grid h-2.5 w-2.5 place-items-center border border-cyan-100/55 bg-background shadow-[0_0_14px_rgba(103,232,249,0.28)]" />
                      <Link
                        href={`/posts/${post.slug}`}
                        className="group flex items-baseline justify-between gap-3 border border-transparent p-2 transition hover:border-cyan-100/16 hover:bg-white/[0.045]"
                      >
                        <span className="flex min-w-0 items-baseline gap-2">
                          {post.frontmatter.pinned ? (
                            <Pin className="h-3.5 w-3.5 shrink-0 text-cyan-100/70" aria-label="置顶" />
                          ) : (
                            <Radio className="h-3.5 w-3.5 shrink-0 text-cyan-100/35" aria-hidden />
                          )}
                          <span className="line-clamp-1 font-medium text-cyan-50/82 group-hover:text-cyan-100">
                            {post.frontmatter.title}
                          </span>
                        </span>
                        <time className="shrink-0 font-mono text-xs text-cyan-50/45">
                          {post.frontmatter.date.slice(5)}
                        </time>
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>
            );
          })}
        </ArchiveLayout>
      )}
    </div>
  );
}
