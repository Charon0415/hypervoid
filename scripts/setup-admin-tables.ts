import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL missing");
const sql = neon(url);

const STATEMENTS = [
  `DO $$ BEGIN
    CREATE TYPE announcement_slot AS ENUM ('top', 'sidebar', 'article_top');
  EXCEPTION WHEN duplicate_object THEN NULL; END $$;`,

  `CREATE TABLE IF NOT EXISTS custom_theme (
    id integer PRIMARY KEY DEFAULT 1,
    enabled boolean NOT NULL DEFAULT false,
    light jsonb NOT NULL DEFAULT '{}'::jsonb,
    dark jsonb NOT NULL DEFAULT '{}'::jsonb,
    updated_at timestamp with time zone NOT NULL DEFAULT now()
  );`,

  `INSERT INTO custom_theme (id) VALUES (1) ON CONFLICT (id) DO NOTHING;`,

  `CREATE TABLE IF NOT EXISTS announcements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slot announcement_slot NOT NULL,
    message text NOT NULL,
    link text,
    link_text text,
    starts_at timestamp with time zone,
    ends_at timestamp with time zone,
    priority integer NOT NULL DEFAULT 0,
    active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
  );`,

  `CREATE TABLE IF NOT EXISTS redirects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text NOT NULL UNIQUE,
    to_url text NOT NULL,
    note text,
    hits integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now()
  );`,

  `CREATE TABLE IF NOT EXISTS audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    actor text NOT NULL,
    action text NOT NULL,
    target_type text,
    target_id text,
    details jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now()
  );`,

  `CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON audit_log (created_at DESC);`,
];

async function main() {
  for (const stmt of STATEMENTS) {
    console.log("-> running:", stmt.split("\n")[0].slice(0, 70), "...");
    await sql.query(stmt);
  }
  console.log("All statements executed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
