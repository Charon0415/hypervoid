import "server-only";

import { revalidatePath } from "next/cache";
import { eq, isNotNull, asc } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

export type SeriesWithPosts = {
  slug: string;
  name: string;
  description: string | null;
  cover: string | null;
  sortOrder: number;
  count: number;
  posts: { slug: string; title: string; seriesOrder: number | null }[];
};

export async function listAllSeries(): Promise<SeriesWithPosts[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.series)
    .orderBy(asc(schema.series.sortOrder), asc(schema.series.name));

  const postRows = await db
    .select({
      slug: schema.posts.slug,
      title: schema.posts.title,
      series: schema.posts.series,
      seriesOrder: schema.posts.seriesOrder,
    })
    .from(schema.posts)
    .where(isNotNull(schema.posts.series));

  const postMap = new Map<
    string,
    { slug: string; title: string; seriesOrder: number | null }[]
  >();
  for (const r of postRows) {
    const name = r.series!;
    const list = postMap.get(name) ?? [];
    list.push({ slug: r.slug, title: r.title, seriesOrder: r.seriesOrder });
    postMap.set(name, list);
  }

  return rows.map((s) => {
    const posts = (postMap.get(s.name) ?? []).sort(
      (a, b) =>
        (a.seriesOrder ?? Number.MAX_SAFE_INTEGER) -
        (b.seriesOrder ?? Number.MAX_SAFE_INTEGER),
    );
    return { ...s, count: posts.length, posts };
  });
}

export async function getSeriesBySlug(
  slug: string,
): Promise<SeriesWithPosts | null> {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.series)
    .where(eq(schema.series.slug, slug))
    .limit(1);
  if (!rows[0]) return null;
  const s = rows[0];
  const posts = await db
    .select({
      slug: schema.posts.slug,
      title: schema.posts.title,
      seriesOrder: schema.posts.seriesOrder,
    })
    .from(schema.posts)
    .where(eq(schema.posts.series, s.name))
    .orderBy(asc(schema.posts.seriesOrder));
  return { ...s, count: posts.length, posts };
}

export async function createSeries(input: {
  slug: string;
  name: string;
  description?: string;
  cover?: string;
}): Promise<void> {
  const db = getDb();
  await db.insert(schema.series).values({
    slug: input.slug,
    name: input.name,
    description: input.description || null,
    cover: input.cover || null,
  });
  revalidatePath("/", "layout");
}

export async function updateSeries(
  oldSlug: string,
  input: {
    slug: string;
    name: string;
    description?: string;
    cover?: string;
  },
): Promise<void> {
  const db = getDb();
  const existing = await getSeriesBySlug(oldSlug);
  if (!existing) throw new Error("系列不存在");

  // If name changed, update all posts referencing the old name
  if (existing.name !== input.name) {
    await db
      .update(schema.posts)
      .set({ series: input.name, updatedAt: new Date() })
      .where(eq(schema.posts.series, existing.name));
  }

  await db
    .update(schema.series)
    .set({
      slug: input.slug,
      name: input.name,
      description: input.description || null,
      cover: input.cover || null,
      updatedAt: new Date(),
    })
    .where(eq(schema.series.slug, oldSlug));
  revalidatePath("/", "layout");
}

export async function deleteSeries(slug: string): Promise<number> {
  const db = getDb();
  const existing = await getSeriesBySlug(slug);
  if (!existing) throw new Error("系列不存在");

  // Remove series reference from all posts
  const result = await db
    .update(schema.posts)
    .set({ series: null, seriesOrder: null, updatedAt: new Date() })
    .where(eq(schema.posts.series, existing.name));

  await db.delete(schema.series).where(eq(schema.series.slug, slug));
  revalidatePath("/", "layout");
  return (result as unknown as { rowCount?: number }).rowCount ?? 0;
}

export async function setPostSeries(
  postSlug: string,
  seriesName: string | null,
  seriesOrder?: number | null,
): Promise<void> {
  const db = getDb();
  await db
    .update(schema.posts)
    .set({
      series: seriesName,
      seriesOrder: seriesOrder ?? null,
      updatedAt: new Date(),
    })
    .where(eq(schema.posts.slug, postSlug));
  revalidatePath("/", "layout");
}

export async function setPostOrder(
  postSlug: string,
  order: number,
): Promise<void> {
  const db = getDb();
  await db
    .update(schema.posts)
    .set({ seriesOrder: order, updatedAt: new Date() })
    .where(eq(schema.posts.slug, postSlug));
}
