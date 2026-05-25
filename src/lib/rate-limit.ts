import "server-only";

import { sql } from "drizzle-orm";
import { getDb } from "@/db/client";

/**
 * Postgres-backed rate limit. Each call does one atomic UPSERT that either
 *   (a) starts a new window with count=1, if the existing row's window has
 *       aged out (or the row doesn't exist), or
 *   (b) increments the existing window's counter.
 *
 * Shared across Vercel Lambdas — the previous in-memory Map version was
 * per-container and let attackers bypass limits by rotating cold starts.
 *
 * Failure mode: if Neon is unreachable, we fail OPEN (allow the request).
 * This is the right tradeoff for non-critical endpoints — better to serve
 * than to error out the whole API on a transient DB blip. AskAI / Kanna /
 * subscribe are not security-critical (they cost money but won't leak
 * data), so fail-open is acceptable. Callers that want fail-closed should
 * check `dbReachable` (false means the limit wasn't actually enforced).
 */

export interface RateLimitOptions {
  /** Max requests within the window. */
  limit: number;
  /** Window duration in seconds. */
  windowSec: number;
  /** Logical bucket (e.g. "subscribe", "guestbook:post"). */
  key: string;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetInSec: number;
  dbReachable: boolean;
}

export async function rateLimit(
  identifier: string,
  opts: RateLimitOptions,
): Promise<RateLimitResult> {
  try {
    const rows = await getDb().execute<{
      count: number;
      reset_in_sec: number;
    }>(sql`
      INSERT INTO rate_limits (key, identifier, window_start, count)
      VALUES (${opts.key}, ${identifier}, NOW(), 1)
      ON CONFLICT (key, identifier) DO UPDATE SET
        count = CASE
          WHEN rate_limits.window_start < NOW() - (${opts.windowSec} || ' seconds')::interval
          THEN 1
          ELSE rate_limits.count + 1
        END,
        window_start = CASE
          WHEN rate_limits.window_start < NOW() - (${opts.windowSec} || ' seconds')::interval
          THEN NOW()
          ELSE rate_limits.window_start
        END
      RETURNING
        count,
        GREATEST(
          0,
          EXTRACT(EPOCH FROM (window_start + (${opts.windowSec} || ' seconds')::interval - NOW()))
        )::int AS reset_in_sec;
    `);

    const row = (rows.rows ?? rows)[0] as
      | { count: number; reset_in_sec: number }
      | undefined;
    if (!row) {
      return {
        ok: true,
        remaining: opts.limit - 1,
        resetInSec: opts.windowSec,
        dbReachable: true,
      };
    }
    const count = Number(row.count);
    const resetInSec = Number(row.reset_in_sec);
    if (count > opts.limit) {
      return { ok: false, remaining: 0, resetInSec, dbReachable: true };
    }
    return {
      ok: true,
      remaining: Math.max(0, opts.limit - count),
      resetInSec,
      dbReachable: true,
    };
  } catch {
    // Fail open — see file header comment.
    return {
      ok: true,
      remaining: opts.limit,
      resetInSec: opts.windowSec,
      dbReachable: false,
    };
  }
}

/**
 * Periodic-cleanup helper — not run automatically. Hook into your existing
 * cron if you want to keep the table small; otherwise stale rows just sit
 * idle. Returns the number of rows deleted.
 */
export async function purgeStaleRateLimits(): Promise<number> {
  try {
    const res = await getDb().execute(sql`
      DELETE FROM rate_limits WHERE window_start < NOW() - INTERVAL '24 hours';
    `);
    return (res as unknown as { rowCount?: number }).rowCount ?? 0;
  } catch {
    return 0;
  }
}
