import "server-only";

import { sql } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

/**
 * Count how many published posts reference a given image URL. Used to flag
 * unreferenced (orphan) blobs in the media gallery.
 */
export async function countPostReferences(urls: string[]): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (urls.length === 0) return map;

  for (const url of urls) {
    const [row] = await getDb()
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(schema.posts)
      .where(sql`${schema.posts.content} ILIKE ${"%" + url + "%"} OR ${schema.posts.cover} = ${url}`);
    map.set(url, row?.count ?? 0);
  }
  return map;
}
