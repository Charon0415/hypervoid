"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  addPhoto,
  createAlbum,
  deleteAlbum,
  deletePhoto,
  updateAlbum,
  updatePhotoCaption,
  type AlbumInput,
} from "@/db/albums";

async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
}

function parseAlbumForm(formData: FormData): AlbumInput {
  const slug = String(formData.get("slug") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!slug) throw new Error("slug required");
  if (!/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    throw new Error("slug 必须是小写字母、数字、连字符");
  }
  if (!name) throw new Error("name required");
  const description = String(formData.get("description") ?? "").trim();
  const coverUrl = String(formData.get("coverUrl") ?? "").trim();
  const sortOrderStr = String(formData.get("sortOrder") ?? "0").trim();
  return {
    slug,
    name,
    description: description || null,
    coverUrl: coverUrl || null,
    sortOrder: Number.isFinite(Number(sortOrderStr))
      ? Number(sortOrderStr)
      : 0,
  };
}

export async function createAlbumAction(formData: FormData) {
  await requireAuth();
  const input = parseAlbumForm(formData);
  const album = await createAlbum(input);
  revalidatePath("/albums");
  revalidatePath("/admin/albums");
  redirect(`/admin/albums/${album.id}/edit`);
}

export async function updateAlbumAction(id: string, formData: FormData) {
  await requireAuth();
  const input = parseAlbumForm(formData);
  await updateAlbum(id, input);
  revalidatePath("/albums");
  revalidatePath(`/albums/${input.slug}`);
  revalidatePath("/admin/albums");
}

export async function deleteAlbumAction(id: string) {
  await requireAuth();
  await deleteAlbum(id);
  revalidatePath("/albums");
  revalidatePath("/admin/albums");
  redirect("/admin/albums");
}

export async function addPhotoAction(
  albumId: string,
  url: string,
  caption: string,
) {
  await requireAuth();
  if (!url) throw new Error("URL required");
  await addPhoto({ albumId, url, caption: caption || null });
  revalidatePath("/albums");
  revalidatePath(`/admin/albums/${albumId}/edit`);
}

export async function updatePhotoCaptionAction(id: string, caption: string) {
  await requireAuth();
  await updatePhotoCaption(id, caption || null);
  revalidatePath("/albums");
}

export async function deletePhotoAction(id: string, albumId: string) {
  await requireAuth();
  await deletePhoto(id);
  revalidatePath("/albums");
  revalidatePath(`/admin/albums/${albumId}/edit`);
}
