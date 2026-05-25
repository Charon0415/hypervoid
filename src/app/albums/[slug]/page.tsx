import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAlbumBySlug,
  listPhotosInAlbum,
} from "@/db/albums";

type Params = { slug: string };

export const revalidate = 60;

export async function generateMetadata(props: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const album = await getAlbumBySlug(slug);
  return {
    title: album ? `${album.name} · 相册` : "相册",
    description: album?.description ?? undefined,
  };
}

export default async function AlbumDetail(props: {
  params: Promise<Params>;
}) {
  const { slug } = await props.params;
  const album = await getAlbumBySlug(slug);
  if (!album) notFound();
  const photos = await listPhotosInAlbum(album.id);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/albums"
        className="text-sm text-muted hover:text-primary"
      >
        ← 所有相册
      </Link>
      <header>
        <h1 className="text-3xl font-bold tracking-tight">{album.name}</h1>
        {album.description ? (
          <p className="mt-2 text-muted">{album.description}</p>
        ) : null}
        <p className="mt-1 text-sm text-muted">{photos.length} 张照片</p>
      </header>
      {photos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          这个相册还没有照片。
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((p) => (
            <a
              key={p.id}
              href={p.url}
              target="_blank"
              rel="noreferrer noopener"
              className="group relative overflow-hidden rounded-md border border-border"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt={p.caption ?? ""}
                className="aspect-square w-full object-cover transition group-hover:scale-110"
                loading="lazy"
              />
              {p.caption ? (
                <p className="dark-locked absolute bottom-0 left-0 right-0 translate-y-full truncate bg-black/60 px-2 py-1 text-xs text-white transition group-hover:translate-y-0">
                  {p.caption}
                </p>
              ) : null}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
