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

export type MonthCalendarCell = {
  day: number;
  date: string;
  isInMonth: boolean;
  isToday: boolean;
  hasPost: boolean;
};

export type MonthCalendar = {
  year: number;
  month: number;
  weeks: MonthCalendarCell[][];
  totalPosts: number;
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

export async function getMonthCalendar(
  year: number,
  month: number,
): Promise<MonthCalendar> {
  const db = getDb();

  const firstOfMonth = new Date(Date.UTC(year, month, 1));
  const firstOfNextMonth = new Date(Date.UTC(year, month + 1, 1));

  const rows = await db
    .select({
      day: sql<string>`TO_CHAR(date_trunc('day', COALESCE(publish_at, created_at)), 'YYYY-MM-DD')`,
    })
    .from(schema.posts)
    .where(
      sql`(status = 'published' OR (status = 'scheduled' AND publish_at <= NOW()))
          AND COALESCE(publish_at, created_at) >= ${firstOfMonth.toISOString()}
          AND COALESCE(publish_at, created_at) < ${firstOfNextMonth.toISOString()}`,
    );

  const postDays = new Set(rows.map((r) => r.day));

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayKey = today.toISOString().slice(0, 10);

  const startSunday = new Date(firstOfMonth);
  startSunday.setUTCDate(firstOfMonth.getUTCDate() - firstOfMonth.getUTCDay());

  const weeks: MonthCalendarCell[][] = [];
  for (let w = 0; w < 6; w++) {
    const week: MonthCalendarCell[] = [];
    for (let d = 0; d < 7; d++) {
      const cell = new Date(startSunday);
      cell.setUTCDate(startSunday.getUTCDate() + w * 7 + d);
      const cellKey = cell.toISOString().slice(0, 10);
      const isInMonth =
        cell.getUTCMonth() === month && cell.getUTCFullYear() === year;
      week.push({
        day: cell.getUTCDate(),
        date: cellKey,
        isInMonth,
        isToday: cellKey === todayKey,
        hasPost: isInMonth && postDays.has(cellKey),
      });
    }
    weeks.push(week);
  }

  return { year, month, weeks, totalPosts: postDays.size };
}
