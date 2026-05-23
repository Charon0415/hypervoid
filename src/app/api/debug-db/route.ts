import { neon } from "@neondatabase/serverless";

export const dynamic = "force-dynamic";

export async function GET() {
  const url = process.env.DATABASE_URL;
  const hasEnv = Boolean(url);
  const envLen = url?.length ?? 0;
  const envStartsWith = url ? url.slice(0, 13) : "";

  let queryStatus: string = "skipped";
  let viewsTable = "skipped";
  let likesTable = "skipped";

  if (url) {
    try {
      const sql = neon(url);
      const r = await sql`SELECT 1 as ok`;
      queryStatus = r[0]?.ok === 1 ? "ok" : "unexpected: " + JSON.stringify(r);
      try {
        const v = await sql`SELECT count FROM post_views LIMIT 1`;
        viewsTable = `ok (${v.length} rows)`;
      } catch (e) {
        viewsTable = `error: ${(e as Error).message}`.slice(0, 200);
      }
      try {
        const l = await sql`SELECT count FROM post_likes LIMIT 1`;
        likesTable = `ok (${l.length} rows)`;
      } catch (e) {
        likesTable = `error: ${(e as Error).message}`.slice(0, 200);
      }
    } catch (e) {
      queryStatus = `error: ${(e as Error).message}`.slice(0, 200);
    }
  }

  return Response.json({
    hasEnv,
    envLen,
    envStartsWith,
    queryStatus,
    viewsTable,
    likesTable,
  });
}
