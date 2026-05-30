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
      <header className="group relative overflow-hidden border border-cyan-100/16 bg-gradient-to-br from-cyan-950/40 to-slate-950/60 p-5 sm:p-7" style={{ clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 0 100%)' }}>
        {/* Corner accents */}
        <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-px w-24 bg-gradient-to-r from-cyan-400/60 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute left-0 top-0 h-24 w-px bg-gradient-to-b from-cyan-400/60 to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-100/45 to-transparent" />

        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-400" />
          <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-cyan-400/70">
            Archive_Timeline / Chronological_Scan
          </p>
        </div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="flex items-center gap-3 font-mono text-3xl font-black uppercase leading-tight tracking-tight text-cyan-50 sm:text-5xl">
            <Archive className="h-8 w-8 text-cyan-300/70 sm:h-10 sm:w-10" aria-hidden />
            Archive
          </h1>
          <span className="inline-flex items-center gap-1.5 border border-cyan-400/30 bg-cyan-400/15 px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider text-cyan-100" style={{ clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 0 100%)' }}>
            <span className="h-1 w-1 rounded-full bg-cyan-400" />
            {posts.length} / {years.length}y
          </span>
        </div>
      </header>
      {years.length === 0 ? (
        <p className="border border-dashed border-cyan-100/20 bg-cyan-950/20 p-8 text-center font-mono text-sm uppercase tracking-wider text-cyan-50/60" style={{ clipPath: 'polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)' }}>
          No_Posts_Yet
        </p>
      ) : (
        <ArchiveLayout>
          {years.map((year) => {
            const posts = byYear.get(year)!;
            return (
              <section key={year} className="flex flex-col gap-3">
                <h2 className="flex items-baseline gap-2 font-mono text-2xl font-bold uppercase tracking-tight text-cyan-50">
                  {year}
                  <span className="inline-flex items-center gap-1 border border-cyan-100/18 bg-cyan-950/30 px-2 py-0.5 text-xs font-normal normal-case tracking-wider text-cyan-100/70" style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)' }}>
                    {posts.length} Posts
                  </span>
                </h2>
                <ol className="relative ml-2 space-y-3 border-l-2 border-cyan-100/14 pl-5">
                  {posts.map((post) => (
                    <li key={post.slug} className="relative">
                      <span className="absolute -left-[27px] mt-2 grid h-2.5 w-2.5 place-items-center border border-cyan-400/60 bg-cyan-950 shadow-[0_0_14px_rgba(103,232,249,0.28)]" style={{ clipPath: 'polygon(0 0, calc(100% - 2px) 0, 100% 2px, 100% 100%, 0 100%)' }} />
                      <Link
                        href={`/posts/${post.slug}`}
                        className="group flex items-baseline justify-between gap-3 border border-transparent p-2 transition hover:border-cyan-100/20 hover:bg-cyan-950/30"
                        style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)' }}
                      >
                        <span className="flex min-w-0 items-baseline gap-2">
                          {post.frontmatter.pinned ? (
                            <Pin className="h-3.5 w-3.5 shrink-0 text-cyan-400/70" aria-label="置顶" />
                          ) : (
                            <Radio className="h-3.5 w-3.5 shrink-0 text-cyan-100/35" aria-hidden />
                          )}
                          <span className="line-clamp-1 font-medium text-cyan-50/82 transition group-hover:text-cyan-100">
                            {post.frontmatter.title}
                          </span>
                        </span>
                        <time className="shrink-0 font-mono text-xs uppercase tracking-wider text-cyan-50/45">
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
