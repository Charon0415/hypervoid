import "server-only";

import { revalidatePath } from "next/cache";
import { sql as drizzleSql, eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

export type TagRow = {
  name: string;
  count: number;
  slugs: string[];
};

/**
 * Walks the posts table once and builds a per-tag inverted index. Tags
 * live in a jsonb array column — there's no separate tags table — so
 * the only cheap way is to do this in JS.
 */
export async function listTagsWithUsage(): Promise<TagRow[]> {
  const rows = await getDb()
    .select({ slug: schema.posts.slug, tags: schema.posts.tags })
    .from(schema.posts);
  const map = new Map<string, string[]>();
  for (const r of rows) {
    for (const t of r.tags ?? []) {
      const list = map.get(t) ?? [];
      list.push(r.slug);
      map.set(t, list);
    }
  }
  return [...map.entries()]
    .map(([name, slugs]) => ({ name, count: slugs.length, slugs }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

async function rewriteTags(
  oldName: string,
  newName: string | null,
): Promise<number> {
  // Pull only the posts that actually have the tag so we don't write
  // every row in the table when one tag changes.
  const candidates = await getDb()
    .select({ slug: schema.posts.slug, tags: schema.posts.tags })
    .from(schema.posts)
    .where(drizzleSql`${schema.posts.tags} @> ${JSON.stringify([oldName])}::jsonb`);
  let touched = 0;
  for (const c of candidates) {
    const next = (c.tags ?? []).flatMap((t) =>
      t === oldName ? (newName ? [newName] : []) : [t],
    );
    const dedup = [...new Set(next)];
    await getDb()
      .update(schema.posts)
      .set({ tags: dedup, updatedAt: new Date() })
      .where(eq(schema.posts.slug, c.slug));
    touched++;
  }
  return touched;
}

export async function renameTag(
  oldName: string,
  newName: string,
): Promise<number> {
  if (!oldName || !newName) throw new Error("缺少标签名");
  if (oldName === newName) return 0;
  const n = await rewriteTags(oldName, newName);
  revalidatePath("/", "layout");
  return n;
}

/**
 * Renames one of `sources` to `target`. If `target` already exists on a
 * post that also had a source tag, dedup keeps it from appearing twice.
 */
export async function mergeTags(
  sources: string[],
  target: string,
): Promise<number> {
  if (!target) throw new Error("目标标签名不能为空");
  let total = 0;
  for (const src of sources) {
    if (src === target) continue;
    total += await rewriteTags(src, target);
  }
  revalidatePath("/", "layout");
  return total;
}

export async function deleteTag(name: string): Promise<number> {
  if (!name) throw new Error("缺少标签名");
  const n = await rewriteTags(name, null);
  revalidatePath("/", "layout");
  return n;
}
