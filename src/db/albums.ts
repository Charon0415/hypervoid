import "server-only";

import { asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

export type Album = typeof schema.albums.$inferSelect;
export type Photo = typeof schema.photos.$inferSelect;

export async function listAlbums(): Promise<Album[]> {
  return getDb()
    .select()
    .from(schema.albums)
    .orderBy(asc(schema.albums.sortOrder), asc(schema.albums.createdAt));
}

export async function getAlbum(id: string): Promise<Album | null> {
  const rows = await getDb()
    .select()
    .from(schema.albums)
    .where(eq(schema.albums.id, id))
    .limit(1);
  return rows[0] ?? null;
}

export async function getAlbumBySlug(slug: string): Promise<Album | null> {
  const rows = await getDb()
    .select()
    .from(schema.albums)
    .where(eq(schema.albums.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function listPhotosInAlbum(albumId: string): Promise<Photo[]> {
  return getDb()
    .select()
    .from(schema.photos)
    .where(eq(schema.photos.albumId, albumId))
    .orderBy(asc(schema.photos.sortOrder), asc(schema.photos.createdAt));
}

export type AlbumInput = {
  slug: string;
  name: string;
  description?: string | null;
  coverUrl?: string | null;
  displayMode?: string;
  sortOrder?: number;
};

export async function createAlbum(input: AlbumInput): Promise<Album> {
  const rows = await getDb()
    .insert(schema.albums)
    .values({
      slug: input.slug,
      name: input.name,
      description: input.description ?? null,
      coverUrl: input.coverUrl ?? null,
      displayMode: input.displayMode ?? "wall",
      sortOrder: input.sortOrder ?? 0,
    })
    .returning();
  return rows[0];
}

export async function updateAlbum(id: string, input: AlbumInput): Promise<void> {
  await getDb()
    .update(schema.albums)
    .set({
      slug: input.slug,
      name: input.name,
      description: input.description ?? null,
      coverUrl: input.coverUrl ?? null,
      displayMode: input.displayMode ?? "wall",
      sortOrder: input.sortOrder ?? 0,
      updatedAt: new Date(),
    })
    .where(eq(schema.albums.id, id));
}

export async function deleteAlbum(id: string): Promise<void> {
  await getDb().delete(schema.albums).where(eq(schema.albums.id, id));
}

export async function addPhoto(input: {
  albumId: string;
  url: string;
  caption?: string | null;
}): Promise<Photo> {
  const rows = await getDb()
    .insert(schema.photos)
    .values({
      albumId: input.albumId,
      url: input.url,
      caption: input.caption ?? null,
    })
    .returning();
  return rows[0];
}

export async function updatePhotoCaption(
  id: string,
  caption: string | null,
): Promise<void> {
  await getDb()
    .update(schema.photos)
    .set({ caption })
    .where(eq(schema.photos.id, id));
}

export async function deletePhoto(id: string): Promise<void> {
  await getDb().delete(schema.photos).where(eq(schema.photos.id, id));
}
