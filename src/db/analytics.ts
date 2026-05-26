import "server-only";

import { desc, sql } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

export type TopPostRow = {
  slug: string;
  title: string;
  views: number;
  likes: number;
  publishAt: Date | null;
};

export async function listTopPostsByViews(limit = 10): Promise<TopPostRow[]> {
  return getDb()
    .select({
      slug: schema.posts.slug,
      title: schema.posts.title,
      views: sql<number>`COALESCE(v.count, 0)::int`,
      likes: sql<number>`COALESCE(r.total, 0)::int`,
      publishAt: schema.posts.publishAt,
    })
    .from(schema.posts)
    .leftJoin(
      sql`(SELECT slug, count FROM ${schema.postViews}) v`,
      sql`v.slug = ${schema.posts.slug}`,
    )
    .leftJoin(
      sql`(SELECT slug, SUM(count)::int AS total FROM ${schema.postReactions} GROUP BY slug) r`,
      sql`r.slug = ${schema.posts.slug}`,
    )
    .where(
      sql`(status = 'published' OR (status = 'scheduled' AND publish_at <= NOW()))`,
    )
    .orderBy(
      desc(sql`COALESCE(v.count, 0)`),
      desc(schema.posts.publishAt),
    )
    .limit(limit);
}

export async function listTopPostsByLikes(limit = 10): Promise<TopPostRow[]> {
  return getDb()
    .select({
      slug: schema.posts.slug,
      title: schema.posts.title,
      views: sql<number>`COALESCE(v.count, 0)::int`,
      likes: sql<number>`COALESCE(r.total, 0)::int`,
      publishAt: schema.posts.publishAt,
    })
    .from(schema.posts)
    .leftJoin(
      sql`(SELECT slug, count FROM ${schema.postViews}) v`,
      sql`v.slug = ${schema.posts.slug}`,
    )
    .leftJoin(
      sql`(SELECT slug, SUM(count)::int AS total FROM ${schema.postReactions} GROUP BY slug) r`,
      sql`r.slug = ${schema.posts.slug}`,
    )
    .where(
      sql`(status = 'published' OR (status = 'scheduled' AND publish_at <= NOW()))`,
    )
    .orderBy(
      desc(sql`COALESCE(r.total, 0)`),
      desc(schema.posts.publishAt),
    )
    .limit(limit);
}

export type MonthlyPosts = {
  month: string;
  count: number;
};

export async function listMonthlyPostCounts(months = 12): Promise<MonthlyPosts[]> {
  const rows = await getDb()
    .select({
      month: sql<string>`TO_CHAR(
        DATE_TRUNC('month', COALESCE(publish_at, created_at) AT TIME ZONE 'Asia/Shanghai'),
        'YYYY-MM'
      )`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(schema.posts)
    .where(
      sql`(status = 'published' OR (status = 'scheduled' AND publish_at <= NOW()))
          AND COALESCE(publish_at, created_at) >= NOW() - INTERVAL '${sql.raw(String(months))} months'`,
    )
    .groupBy(
      sql`DATE_TRUNC('month', COALESCE(publish_at, created_at) AT TIME ZONE 'Asia/Shanghai')`,
    )
    .orderBy(
      sql`DATE_TRUNC('month', COALESCE(publish_at, created_at) AT TIME ZONE 'Asia/Shanghai')`,
    );

  // Fill missing months with 0
  const now = new Date();
  const filled: MonthlyPosts[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const found = rows.find((r) => r.month === key);
    filled.push({ month: key, count: found?.count ?? 0 });
  }
  return filled;
}
