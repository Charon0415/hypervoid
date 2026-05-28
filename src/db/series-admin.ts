import "server-only";

import { revalidatePath } from "next/cache";
import { eq, isNotNull } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

export type SeriesRow = {
  name: string;
  count: number;
  posts: { slug: string; title: string; seriesOrder: number | null }[];
};

export async function listSeriesWithPosts(): Promise<SeriesRow[]> {
  const rows = await getDb()
    .select({
      slug: schema.posts.slug,
      title: schema.posts.title,
      series: schema.posts.series,
      seriesOrder: schema.posts.seriesOrder,
    })
    .from(schema.posts)
    .where(isNotNull(schema.posts.series));

  const grouped = new Map<
    string,
    { slug: string; title: string; seriesOrder: number | null }[]
  >();
  for (const r of rows) {
    const name = r.series!;
    const list = grouped.get(name) ?? [];
    list.push({ slug: r.slug, title: r.title, seriesOrder: r.seriesOrder });
    grouped.set(name, list);
  }

  return [...grouped.entries()]
    .map(([name, posts]) => {
      posts.sort(
        (a, b) =>
          (a.seriesOrder ?? Number.MAX_SAFE_INTEGER) -
          (b.seriesOrder ?? Number.MAX_SAFE_INTEGER),
      );
      return { name, count: posts.length, posts };
    })
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export async function renameSeries(
  oldName: string,
  newName: string,
): Promise<number> {
  if (!oldName || !newName) throw new Error("缺少系列名");
  if (oldName === newName) return 0;
  const db = getDb();
  const result = await db
    .update(schema.posts)
    .set({ series: newName, updatedAt: new Date() })
    .where(eq(schema.posts.series, oldName));
  revalidatePath("/", "layout");
  return (result as unknown as { rowCount?: number }).rowCount ?? 0;
}

export async function deleteSeries(name: string): Promise<number> {
  if (!name) throw new Error("缺少系列名");
  const db = getDb();
  const result = await db
    .update(schema.posts)
    .set({ series: null, seriesOrder: null, updatedAt: new Date() })
    .where(eq(schema.posts.series, name));
  revalidatePath("/", "layout");
  return (result as unknown as { rowCount?: number }).rowCount ?? 0;
}
