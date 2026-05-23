import "server-only";

import { desc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

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
      publishAt: input.publishAt,
      createdAt: now,
      updatedAt: now,
    });
}

export async function updatePost(
  slug: string,
  input: Omit<AdminPostInput, "slug">,
): Promise<void> {
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
      publishAt: input.publishAt,
      updatedAt: new Date(),
    })
    .where(eq(schema.posts.slug, slug));
}

export async function deletePost(slug: string): Promise<void> {
  await getDb().delete(schema.posts).where(eq(schema.posts.slug, slug));
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
