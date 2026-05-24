import "server-only";

import { sql } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { formatDateCN } from "@/lib/datetime";
import { siteConfig } from "@/lib/site-config";

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

const SITE_START_MS = new Date(
  `${siteConfig.launchedAt}T00:00:00+08:00`,
).getTime();

const WEEKDAY_INDEX: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

function dayOfWeekCN(d: Date): number {
  const wd = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    weekday: "short",
  }).format(d);
  return WEEKDAY_INDEX[wd] ?? 0;
}

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
    Math.floor((Date.now() - SITE_START_MS) / 86_400_000),
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
      day: sql<string>`TO_CHAR(
        (COALESCE(publish_at, created_at) AT TIME ZONE 'Asia/Shanghai')::date,
        'YYYY-MM-DD'
      )`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(schema.posts)
    .where(
      sql`(status = 'published' OR (status = 'scheduled' AND publish_at <= NOW()))
          AND COALESCE(publish_at, created_at) >= NOW() - INTERVAL '${sql.raw(String(weeks + 1))} weeks'`,
    )
    .groupBy(
      sql`(COALESCE(publish_at, created_at) AT TIME ZONE 'Asia/Shanghai')::date`,
    );

  const map = new Map<string, number>();
  for (const r of rows) map.set(r.day, r.count);

  const todayStr = formatDateCN(new Date());
  const todayMs = new Date(`${todayStr}T00:00:00+08:00`).getTime();
  const dow = dayOfWeekCN(new Date(todayMs));
  const endMs = todayMs + (6 - dow) * 86_400_000;
  const startMs = endMs - (weeks * 7 - 1) * 86_400_000;

  const days: HeatmapDay[] = [];
  for (let i = 0; i < weeks * 7; i++) {
    const key = formatDateCN(new Date(startMs + i * 86_400_000));
    days.push({ date: key, count: map.get(key) ?? 0 });
  }
  return days;
}

export async function getMonthCalendar(
  year: number,
  month: number,
): Promise<MonthCalendar> {
  const db = getDb();

  const firstOfMonthMs = new Date(
    `${year}-${String(month + 1).padStart(2, "0")}-01T00:00:00+08:00`,
  ).getTime();
  const firstOfNextMonthMs = new Date(
    `${month === 11 ? year + 1 : year}-${String(((month + 1) % 12) + 1).padStart(2, "0")}-01T00:00:00+08:00`,
  ).getTime();

  const rows = await db
    .select({
      day: sql<string>`TO_CHAR(
        (COALESCE(publish_at, created_at) AT TIME ZONE 'Asia/Shanghai')::date,
        'YYYY-MM-DD'
      )`,
    })
    .from(schema.posts)
    .where(
      sql`(status = 'published' OR (status = 'scheduled' AND publish_at <= NOW()))
          AND COALESCE(publish_at, created_at) >= ${new Date(firstOfMonthMs).toISOString()}
          AND COALESCE(publish_at, created_at) < ${new Date(firstOfNextMonthMs).toISOString()}`,
    );

  const postDays = new Set(rows.map((r) => r.day));
  const todayKey = formatDateCN(new Date());

  const firstDow = dayOfWeekCN(new Date(firstOfMonthMs));
  const gridStartMs = firstOfMonthMs - firstDow * 86_400_000;

  const weeks: MonthCalendarCell[][] = [];
  for (let w = 0; w < 6; w++) {
    const week: MonthCalendarCell[] = [];
    for (let d = 0; d < 7; d++) {
      const cellMs = gridStartMs + (w * 7 + d) * 86_400_000;
      const cellDate = new Date(cellMs);
      const cellKey = formatDateCN(cellDate);
      const cellMonth = Number(
        new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Shanghai",
          month: "numeric",
        }).format(cellDate),
      ) - 1;
      const cellYear = Number(
        new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Shanghai",
          year: "numeric",
        }).format(cellDate),
      );
      const cellDay = Number(
        new Intl.DateTimeFormat("en-US", {
          timeZone: "Asia/Shanghai",
          day: "numeric",
        }).format(cellDate),
      );
      const isInMonth = cellMonth === month && cellYear === year;
      week.push({
        day: cellDay,
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
