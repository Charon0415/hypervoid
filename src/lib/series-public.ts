import { getDb, schema } from "@/db/client";
import { asc, isNotNull } from "drizzle-orm";

export type PublicSeries = {
  slug: string;
  name: string;
  description: string | null;
  cover: string | null;
  count: number;
};

export async function getPublicSeriesList(): Promise<PublicSeries[]> {
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.series)
    .orderBy(asc(schema.series.sortOrder), asc(schema.series.name));

  if (rows.length === 0) return [];

  const postRows = await db
    .select({ series: schema.posts.series })
    .from(schema.posts)
    .where(isNotNull(schema.posts.series));

  const countMap = new Map<string, number>();
  for (const r of postRows) {
    if (r.series) countMap.set(r.series, (countMap.get(r.series) ?? 0) + 1);
  }

  return rows.map((s) => ({
    slug: s.slug,
    name: s.name,
    description: s.description,
    cover: s.cover,
    count: countMap.get(s.name) ?? 0,
  }));
}
