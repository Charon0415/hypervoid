import "server-only";

import { and, asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

export type Resource = typeof schema.resources.$inferSelect;
export type NewResource = typeof schema.resources.$inferInsert;

export async function listResources(opts?: { includeHidden?: boolean }) {
  const where = opts?.includeHidden
    ? undefined
    : eq(schema.resources.hidden, false);
  return getDb()
    .select()
    .from(schema.resources)
    .where(where)
    .orderBy(
      asc(schema.resources.category),
      asc(schema.resources.sortOrder),
      asc(schema.resources.title),
    );
}

export async function createResource(input: {
  title: string;
  description?: string | null;
  url: string;
  category: string;
  icon?: string | null;
  hidden?: boolean;
  sortOrder?: number;
}): Promise<void> {
  await getDb()
    .insert(schema.resources)
    .values({
      title: input.title,
      description: input.description ?? null,
      url: input.url,
      category: input.category || "其他",
      icon: input.icon ?? null,
      hidden: input.hidden ?? false,
      sortOrder: input.sortOrder ?? 0,
    });
}

export async function updateResource(
  id: string,
  input: Partial<{
    title: string;
    description: string | null;
    url: string;
    category: string;
    icon: string | null;
    hidden: boolean;
    sortOrder: number;
  }>,
): Promise<void> {
  await getDb()
    .update(schema.resources)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(schema.resources.id, id));
}

export async function deleteResource(id: string): Promise<void> {
  await getDb()
    .delete(schema.resources)
    .where(eq(schema.resources.id, id));
}

/** Group resources by category — preserves the natural sort_order within each. */
export function groupByCategory(items: Resource[]): Map<string, Resource[]> {
  const map = new Map<string, Resource[]>();
  for (const r of items) {
    const bucket = map.get(r.category) ?? [];
    bucket.push(r);
    map.set(r.category, bucket);
  }
  return map;
}
