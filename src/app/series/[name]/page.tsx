import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllSeries, getPostsBySeries } from "@/lib/posts";

type Params = { name: string };

export const revalidate = 60;

export async function generateStaticParams(): Promise<Params[]> {
  const list = await getAllSeries();
  return list.map((s) => ({ name: encodeURIComponent(s.name) }));
}

export const dynamicParams = true;

export async function generateMetadata(
  props: { params: Promise<Params> },
): Promise<Metadata> {
  const { name } = await props.params;
  const decoded = decodeURIComponent(name);
  return {
    title: `${decoded} · 系列`,
    description: `「${decoded}」系列下的所有文章`,
  };
}

export default async function SeriesDetailPage(
  props: { params: Promise<Params> },
) {
  const { name } = await props.params;
  const decoded = decodeURIComponent(name);
  const posts = await getPostsBySeries(decoded);
  if (posts.length === 0) notFound();

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <Link
        href="/series"
        className="group inline-flex w-fit items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium text-foreground/80 transition hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
      >
        <svg
          aria-hidden
          className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
        所有系列
      </Link>

      <header>
        <p className="text-xs uppercase tracking-widest text-primary">
          ✦ Series
        </p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
          {decoded}
        </h1>
        <p className="mt-2 text-sm text-muted">共 {posts.length} 篇</p>
      </header>

      <ol className="flex flex-col gap-2">
        {posts.map((post, i) => (
          <li key={post.slug}>
            <Link
              href={`/posts/${post.slug}`}
              className="group flex items-baseline gap-4 rounded-xl border border-border bg-card p-4 transition hover:border-primary/40 hover:shadow-sm"
            >
              <span className="shrink-0 font-mono text-sm text-muted">
                {String(post.frontmatter.seriesOrder ?? i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium tracking-tight transition group-hover:text-primary">
                  {post.frontmatter.title}
                </p>
                {post.frontmatter.description ? (
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted">
                    {post.frontmatter.description}
                  </p>
                ) : null}
              </div>
              <time className="shrink-0 font-mono text-xs text-muted">
                {post.frontmatter.date}
              </time>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
