import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "@/db/schema";
import { getViewCount } from "@/db/posts-stats";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.DATABASE_URL;
  const hasEnv = Boolean(url);
  const envLen = url?.length ?? 0;
  const envStartsWith = url ? url.slice(0, 13) : "";

  let rawQueryStatus: string = "skipped";
  let drizzleSelect: string = "skipped";
  let drizzleViewCountResult: unknown = "skipped";

  if (url) {
    try {
      const sql = neon(url);
      const r = await sql`SELECT 1 as ok`;
      rawQueryStatus = r[0]?.ok === 1 ? "ok" : "unexpected: " + JSON.stringify(r);
    } catch (e) {
      rawQueryStatus = `throw: ${(e as Error).message}`.slice(0, 300);
    }

    try {
      const sql = neon(url);
      const db = drizzle({ client: sql, schema });
      const rows = await db
        .select({ count: schema.postViews.count })
        .from(schema.postViews)
        .where(eq(schema.postViews.slug, "hello-world"))
        .limit(1);
      drizzleSelect = `ok rows=${rows.length} value=${JSON.stringify(rows)}`;
    } catch (e) {
      drizzleSelect = `throw: ${(e as Error).message}`.slice(0, 300);
    }
  }

  try {
    drizzleViewCountResult = await getViewCount("hello-world");
  } catch (e) {
    drizzleViewCountResult = `throw: ${(e as Error).message}`.slice(0, 300);
  }

  return Response.json({
    hasEnv,
    envLen,
    envStartsWith,
    rawQueryStatus,
    drizzleSelect,
    drizzleViewCountResult,
  });
}
