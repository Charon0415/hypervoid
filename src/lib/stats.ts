import "server-only";

import { sql } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

export type SiteStats = {
  posts: number;
  views: number;
  likes: number;
  daysOnline: number;
};

export type HeatmapDay = {
  date: string;
  count: number;
};

const SITE_START = new Date("2026-05-23T00:00:00Z");

export async function getSiteStats(): Promise<SiteStats> {
  const db = getDb();

  const [postsRow] = await db
    .select({ count: sql<number>`COUNT(*)::int` })
    .from(schema.posts)
    .where(sql`status = 'published' OR (status = 'scheduled' AND publish_at <= NOW())`);

  const [viewsRow] = await db
    .select({ sum: sql<number>`COALESCE(SUM(count), 0)::int` })
    .from(schema.postViews);

  const [likesRow] = await db
    .select({ sum: sql<number>`COALESCE(SUM(count), 0)::int` })
    .from(schema.postLikes);

  const daysOnline = Math.max(
    1,
    Math.floor((Date.now() - SITE_START.getTime()) / (24 * 60 * 60 * 1000)),
  );

  return {
    posts: postsRow?.count ?? 0,
    views: viewsRow?.sum ?? 0,
    likes: likesRow?.sum ?? 0,
    daysOnline,
  };
}

export async function getPostHeatmap(weeks = 16): Promise<HeatmapDay[]> {
  const db = getDb();

  const rows = await db
    .select({
      day: sql<string>`TO_CHAR(date_trunc('day', COALESCE(publish_at, created_at)), 'YYYY-MM-DD')`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(schema.posts)
    .where(
      sql`(status = 'published' OR (status = 'scheduled' AND publish_at <= NOW()))
          AND COALESCE(publish_at, created_at) >= NOW() - INTERVAL '${sql.raw(String(weeks))} weeks'`,
    )
    .groupBy(sql`date_trunc('day', COALESCE(publish_at, created_at))`);

  const map = new Map<string, number>();
  for (const r of rows) map.set(r.day, r.count);

  const days: HeatmapDay[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const dayOfWeek = today.getUTCDay();
  const endOfWeek = new Date(today);
  endOfWeek.setUTCDate(today.getUTCDate() + (6 - dayOfWeek));

  const start = new Date(endOfWeek);
  start.setUTCDate(endOfWeek.getUTCDate() - (weeks * 7 - 1));

  for (let i = 0; i < weeks * 7; i++) {
    const d = new Date(start);
    d.setUTCDate(start.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: map.get(key) ?? 0 });
  }
  return days;
}
