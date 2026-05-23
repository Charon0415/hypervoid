import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { neon } from "@neondatabase/serverless";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set");
  const sql = neon(url);

  console.log("[1/3] CREATE EXTENSION pg_trgm...");
  await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`;

  console.log("[2/3] CREATE INDEX posts_search_idx (GIN trgm) ...");
  await sql`CREATE INDEX IF NOT EXISTS posts_search_idx
    ON posts USING GIN (
      (title || ' ' || coalesce(description, '') || ' ' || content) gin_trgm_ops
    )`;

  console.log("[3/3] CREATE INDEX posts_title_trgm_idx (for similarity ranking) ...");
  await sql`CREATE INDEX IF NOT EXISTS posts_title_trgm_idx
    ON posts USING GIN (title gin_trgm_ops)`;

  console.log("Done. Search ready.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
