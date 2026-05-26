import "server-only";

import { createHash } from "node:crypto";
import { and, desc, eq, gte, sql as drizzleSql } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

const IP_HASH_SALT =
  process.env.SEARCH_LOG_SALT ?? "hypervoid-search-default-salt";

function hashIp(ip: string | null): string | null {
  if (!ip) return null;
  return createHash("sha256")
    .update(IP_HASH_SALT + ip)
    .digest("hex")
    .slice(0, 16);
}

/** Best-effort: never blocks/throws to the caller. */
export async function logSearchQuery(input: {
  query: string;
  resultCount: number;
  ip: string | null;
}): Promise<void> {
  try {
    const q = input.query.trim();
    if (!q || q.length > 200) return;
    await getDb().insert(schema.searchLog).values({
      query: q,
      resultCount: input.resultCount,
      ipHash: hashIp(input.ip),
    });
  } catch {
    // swallow
  }
}

export type SearchAggRow = {
  query: string;
  hits: number;
  uniqueIps: number;
  zeroResultHits: number;
  lastSeen: Date;
};

export async function listTopQueries(opts: {
  sinceDays: number;
  limit: number;
  zeroOnly?: boolean;
}): Promise<SearchAggRow[]> {
  const since = new Date(Date.now() - opts.sinceDays * 86_400_000);
  const where = opts.zeroOnly
    ? and(
        gte(schema.searchLog.createdAt, since),
        eq(schema.searchLog.resultCount, 0),
      )
    : gte(schema.searchLog.createdAt, since);
  const rows = await getDb()
    .select({
      query: schema.searchLog.query,
      hits: drizzleSql<number>`count(*)::int`,
      uniqueIps: drizzleSql<number>`count(distinct ${schema.searchLog.ipHash})::int`,
      zeroResultHits: drizzleSql<number>`sum(case when ${schema.searchLog.resultCount} = 0 then 1 else 0 end)::int`,
      lastSeen: drizzleSql<Date>`max(${schema.searchLog.createdAt})`,
    })
    .from(schema.searchLog)
    .where(where)
    .groupBy(schema.searchLog.query)
    .orderBy(desc(drizzleSql`count(*)`))
    .limit(opts.limit);
  return rows;
}

export async function countSearchLog(sinceDays: number): Promise<{
  total: number;
  zero: number;
  distinctQueries: number;
}> {
  const since = new Date(Date.now() - sinceDays * 86_400_000);
  const [row] = await getDb()
    .select({
      total: drizzleSql<number>`count(*)::int`,
      zero: drizzleSql<number>`sum(case when ${schema.searchLog.resultCount} = 0 then 1 else 0 end)::int`,
      distinctQueries: drizzleSql<number>`count(distinct ${schema.searchLog.query})::int`,
    })
    .from(schema.searchLog)
    .where(gte(schema.searchLog.createdAt, since));
  return {
    total: row?.total ?? 0,
    zero: row?.zero ?? 0,
    distinctQueries: row?.distinctQueries ?? 0,
  };
}

export async function clearSearchLog(): Promise<void> {
  await getDb().delete(schema.searchLog);
}
