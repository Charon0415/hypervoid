import Link from "next/link";
import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { ArchiveLayout } from "@/components/ArchiveLayout";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "归档",
  description: "全部文章按时间线归档",
};

export default async function ArchivePage() {
  const posts = await getAllPosts();

  const byYear = new Map<string, typeof posts>();
  for (const post of posts) {
    const year = post.frontmatter.date.slice(0, 4);
    if (!byYear.has(year)) byYear.set(year, []);
    byYear.get(year)!.push(post);
  }
  const years = [...byYear.keys()].sort((a, b) => (a < b ? 1 : -1));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">归档</h1>
        <p className="mt-2 text-sm text-muted">
          共 {posts.length} 篇文章，覆盖 {years.length} 年。
        </p>
      </header>
      {years.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          还没有文章。
        </p>
      ) : (
        <ArchiveLayout>
          {years.map((year) => {
            const posts = byYear.get(year)!;
            return (
              <section key={year} className="flex flex-col gap-3">
                <h2 className="text-2xl font-bold text-muted">
                  {year}
                  <span className="ml-2 text-sm font-normal">
                    · {posts.length} 篇
                  </span>
                </h2>
                <ol className="relative ml-2 space-y-3 border-l border-border pl-5">
                  {posts.map((post) => (
                    <li key={post.slug} className="relative">
                      <span className="absolute -left-[26px] mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-primary bg-background" />
                      <Link
                        href={`/posts/${post.slug}`}
                        className="group flex items-baseline justify-between gap-3 rounded-md border border-transparent p-2 transition hover:border-border hover:bg-card"
                      >
                        <span className="flex items-baseline gap-2">
                          {post.frontmatter.pinned ? (
                            <span title="置顶">📌</span>
                          ) : null}
                          <span className="font-medium group-hover:text-primary">
                            {post.frontmatter.title}
                          </span>
                        </span>
                        <time className="shrink-0 font-mono text-xs text-muted">
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
