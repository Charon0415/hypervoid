/**
 * Database backup script — exports all tables as JSON.
 * Usage: pnpm exec tsx scripts/backup-db.ts --out backups/hypervoid-<date>.json
 */
import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { getDb, schema } from "@/db/client";
import * as fs from "node:fs";
import { dirname } from "node:path";

const outIdx = process.argv.indexOf("--out");
const outPath = outIdx >= 0 ? process.argv[outIdx + 1] : "";

if (!outPath) {
  console.error("Usage: pnpm exec tsx scripts/backup-db.ts --out <path>");
  process.exit(1);
}

const TABLE_LIST = [
  "posts",
  "postViews",
  "postLikes",
  "subscribers",
  "friends",
  "guestbookMessages",
  "albums",
  "photos",
  "siteOverrides",
  "customTheme",
  "announcements",
  "redirects",
  "auditLog",
] as const;

async function main() {
  const db = getDb();
  const tables: Record<string, unknown[]> = {};

  for (const name of TABLE_LIST) {
    try {
      const t = schema[name];
      if (t) {
        tables[name] = await db.select().from(t);
        console.log(`  ${name}: ${tables[name].length} rows`);
      }
    } catch (e) {
      console.warn(`  ${name}: SKIPPED (${(e as Error).message})`);
    }
  }

  const json = JSON.stringify(
    { exportedAt: new Date().toISOString(), tables },
    null,
    2,
  );

  fs.mkdirSync(dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, json, "utf-8");
  console.log(`Exported ${Object.keys(tables).length} tables to ${outPath}`);
}

main().catch((e) => {
  console.error("Backup failed:", e);
  process.exit(1);
});
