import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAlbumBySlug, listPhotosInAlbum } from "@/db/albums";
import { PhotoSphereGL } from "@/components/PhotoSphereGL";

type Params = { slug: string };

export const revalidate = 60;

export async function generateMetadata(props: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const album = await getAlbumBySlug(slug);
  return {
    title: album ? `${album.name} · WebGL 球体` : "WebGL 球体",
    description: album?.description ?? undefined,
  };
}

export default async function AlbumSphereGL(props: {
  params: Promise<Params>;
}) {
  const { slug } = await props.params;
  const album = await getAlbumBySlug(slug);
  if (!album) notFound();
  const photos = await listPhotosInAlbum(album.id);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Link
          href={`/albums/${slug}`}
          className="text-sm text-muted hover:text-primary"
        >
          ← 返回相册
        </Link>
        <div className="flex gap-2">
          <Link
            href={`/albums/${slug}/sphere`}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted transition hover:border-primary hover:text-primary"
          >
            CSS 球体
          </Link>
          <Link
            href={`/albums/${slug}`}
            className="rounded-full border border-border px-3 py-1 text-xs text-muted transition hover:border-primary hover:text-primary"
          >
            照片墙
          </Link>
        </div>
      </div>
      <header className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">{album.name}</h1>
        {album.description ? (
          <p className="mt-1 text-sm text-muted">{album.description}</p>
        ) : null}
        <p className="mt-1 text-xs text-muted/60">WebGL · Three.js</p>
      </header>
      {photos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          这个相册还没有照片。
        </p>
      ) : (
        <PhotoSphereGL photos={photos} />
      )}
    </div>
  );
}
