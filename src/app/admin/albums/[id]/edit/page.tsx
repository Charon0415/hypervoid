import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  AlbumForm,
  type AlbumFormInitial,
} from "@/components/admin/AlbumForm";
import { PhotoManager } from "@/components/admin/PhotoManager";
import { AdminBackLink } from "@/components/admin/AdminBackLink";
import { getAlbum, listPhotosInAlbum, type Album } from "@/db/albums";
import {
  deleteAlbumAction,
  updateAlbumAction,
} from "@/app/admin/albums/actions";

type Params = { id: string };

function rowToInitial(row: Album): AlbumFormInitial {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description ?? "",
    coverUrl: row.coverUrl ?? "",
    sortOrder: String(row.sortOrder),
  };
}

export const metadata: Metadata = {
  title: "编辑相册",
  robots: { index: false, follow: false },
};

export default async function EditAlbumPage(props: {
  params: Promise<Params>;
}) {
  const { id } = await props.params;
  const album = await getAlbum(id);
  if (!album) notFound();
  const photos = await listPhotosInAlbum(id);

  const updateBound = updateAlbumAction.bind(null, id);
  const deleteBound = deleteAlbumAction.bind(null, id);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center gap-3">
        <AdminBackLink href="/admin/albums" label="相册列表" />
        <h1 className="text-2xl font-bold tracking-tight">编辑相册</h1>
      </header>
      <AlbumForm
        mode="edit"
        initial={rowToInitial(album)}
        onSubmit={updateBound}
        onDelete={deleteBound}
      />
      <hr className="border-border" />
      <PhotoManager
        albumId={id}
        photos={photos.map((p) => ({
          id: p.id,
          url: p.url,
          caption: p.caption,
        }))}
      />
    </div>
  );
}
