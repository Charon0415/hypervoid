import "server-only";

import { desc, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { estimateReadingTime } from "@/lib/reading-time";

export type AdminPost = typeof schema.posts.$inferSelect;
export type AdminPostInput = {
  slug: string;
  title: string;
  description?: string | null;
  content: string;
  category?: string | null;
  tags: string[];
  cover?: string | null;
  pinned: boolean;
  status: "draft" | "scheduled" | "published";
  visibility: "public" | "private";
  series?: string | null;
  seriesOrder?: number | null;
  publishAt: Date | null;
};

export async function listAllPosts(): Promise<AdminPost[]> {
  return getDb()
    .select()
    .from(schema.posts)
    .orderBy(desc(schema.posts.updatedAt));
}

export async function getPostForEditing(
  slug: string,
): Promise<AdminPost | null> {
  const rows = await getDb()
    .select()
    .from(schema.posts)
    .where(eq(schema.posts.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function createPost(input: AdminPostInput): Promise<void> {
  const now = new Date();
  const { words } = estimateReadingTime(input.content);
  await getDb()
    .insert(schema.posts)
    .values({
      slug: input.slug,
      title: input.title,
      description: input.description ?? null,
      content: input.content,
      category: input.category ?? null,
      tags: input.tags,
      cover: input.cover ?? null,
      pinned: input.pinned,
      status: input.status,
      visibility: input.visibility,
      series: input.series ?? null,
      seriesOrder: input.seriesOrder ?? null,
      wordCount: words,
      publishAt: input.publishAt,
      createdAt: now,
      updatedAt: now,
    });
}

export async function updatePost(
  slug: string,
  input: Omit<AdminPostInput, "slug">,
): Promise<void> {
  const { words } = estimateReadingTime(input.content);
  await getDb()
    .update(schema.posts)
    .set({
      title: input.title,
      description: input.description ?? null,
      content: input.content,
      category: input.category ?? null,
      tags: input.tags,
      cover: input.cover ?? null,
      pinned: input.pinned,
      status: input.status,
      visibility: input.visibility,
      series: input.series ?? null,
      seriesOrder: input.seriesOrder ?? null,
      wordCount: words,
      publishAt: input.publishAt,
      updatedAt: new Date(),
    })
    .where(eq(schema.posts.slug, slug));
}

export async function deletePost(slug: string): Promise<void> {
  await getDb().delete(schema.posts).where(eq(schema.posts.slug, slug));
}

/** Bulk operations — used by /admin/posts batch toolbar. */
export async function bulkSetStatus(
  slugs: string[],
  status: AdminPostInput["status"],
  publishAt: Date | null,
): Promise<number> {
  if (slugs.length === 0) return 0;
  const rows = await getDb()
    .update(schema.posts)
    .set({ status, publishAt, updatedAt: new Date() })
    .where(inArray(schema.posts.slug, slugs))
    .returning({ slug: schema.posts.slug });
  return rows.length;
}

export async function bulkSetVisibility(
  slugs: string[],
  visibility: AdminPostInput["visibility"],
): Promise<number> {
  if (slugs.length === 0) return 0;
  const rows = await getDb()
    .update(schema.posts)
    .set({ visibility, updatedAt: new Date() })
    .where(inArray(schema.posts.slug, slugs))
    .returning({ slug: schema.posts.slug });
  return rows.length;
}

export async function bulkSetPinned(
  slugs: string[],
  pinned: boolean,
): Promise<number> {
  if (slugs.length === 0) return 0;
  const rows = await getDb()
    .update(schema.posts)
    .set({ pinned, updatedAt: new Date() })
    .where(inArray(schema.posts.slug, slugs))
    .returning({ slug: schema.posts.slug });
  return rows.length;
}

export async function bulkDelete(slugs: string[]): Promise<number> {
  if (slugs.length === 0) return 0;
  const rows = await getDb()
    .delete(schema.posts)
    .where(inArray(schema.posts.slug, slugs))
    .returning({ slug: schema.posts.slug });
  return rows.length;
}

export async function setSummary(slug: string, summary: string): Promise<void> {
  await getDb()
    .update(schema.posts)
    .set({ summary, updatedAt: new Date() })
    .where(eq(schema.posts.slug, slug));
}

export async function clearSummary(slug: string): Promise<void> {
  await getDb()
    .update(schema.posts)
    .set({ summary: null, updatedAt: new Date() })
    .where(eq(schema.posts.slug, slug));
}
