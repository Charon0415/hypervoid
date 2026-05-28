import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAlbumBySlug, listPhotosInAlbum } from "@/db/albums";
import { PhotoSphere } from "@/components/PhotoSphere";

type Params = { slug: string };

export const revalidate = 60;

export async function generateMetadata(props: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const album = await getAlbumBySlug(slug);
  return {
    title: album ? `${album.name} · 3D 球体` : "3D 球体",
    description: album?.description ?? undefined,
  };
}

export default async function AlbumSphere(props: {
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
        <Link
          href={`/albums/${slug}`}
          className="rounded-full border border-border px-3 py-1 text-xs text-muted transition hover:border-primary hover:text-primary"
        >
          切换为照片墙
        </Link>
      </div>
      <header className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">{album.name}</h1>
        {album.description ? (
          <p className="mt-1 text-sm text-muted">{album.description}</p>
        ) : null}
      </header>
      {photos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-muted">
          这个相册还没有照片。
        </p>
      ) : (
        <PhotoSphere photos={photos} />
      )}
    </div>
  );
}
