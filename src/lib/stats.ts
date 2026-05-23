import "server-only";

import { sql } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

export type SiteStats = {
  posts: number;
  views: number;
  likes: number;
  daysOnline: number;
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
