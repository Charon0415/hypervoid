import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getAllSeries, getPostsBySeries } from "@/lib/posts";
import { getPublicSeriesList } from "@/lib/series-public";
import { SeriesPostList } from "@/components/SeriesPostList";

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
  const seriesList = await getPublicSeriesList();
  const series = seriesList.find((s) => s.name === decoded);
  return {
    title: `${decoded} · 系列`,
    description: series?.description ?? `「${decoded}」系列下的所有文章`,
  };
}

export default async function SeriesDetailPage(
  props: { params: Promise<Params> },
) {
  const { name } = await props.params;
  const decoded = decodeURIComponent(name);
  const posts = await getPostsBySeries(decoded);
  if (posts.length === 0) notFound();

  const seriesList = await getPublicSeriesList();
  const series = seriesList.find((s) => s.name === decoded);

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

      {series?.cover ? (
        <div className="overflow-hidden rounded-2xl">
          <img
            src={series.cover}
            alt=""
            className="w-full object-cover"
          />
        </div>
      ) : null}

      {series?.description ? (
        <p className="text-sm text-muted">{series.description}</p>
      ) : null}

      <SeriesPostList posts={posts} seriesName={decoded} />
    </div>
  );
}
