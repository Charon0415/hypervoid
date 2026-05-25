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

  `CREATE TABLE IF NOT EXISTS resources (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title text NOT NULL,
    description text,
    url text NOT NULL,
    category text NOT NULL DEFAULT '其他',
    icon text,
    hidden boolean NOT NULL DEFAULT false,
    sort_order integer NOT NULL DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
  );`,

  `CREATE INDEX IF NOT EXISTS resources_category_sort_idx ON resources (category, sort_order);`,

  `CREATE TABLE IF NOT EXISTS post_reactions (
    slug text NOT NULL,
    emoji text NOT NULL,
    count integer NOT NULL DEFAULT 0,
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (slug, emoji)
  );`,

  // Migrate existing heart counts from post_likes into post_reactions.
  // Idempotent: ON CONFLICT DO NOTHING preserves any newer reaction state.
  `INSERT INTO post_reactions (slug, emoji, count)
     SELECT slug, 'heart', count FROM post_likes
     WHERE count > 0
   ON CONFLICT (slug, emoji) DO NOTHING;`,

  `CREATE TABLE IF NOT EXISTS webmentions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    source text NOT NULL,
    target text NOT NULL,
    target_slug text,
    status text NOT NULL DEFAULT 'pending',
    type text NOT NULL DEFAULT 'mention',
    content text,
    author_name text,
    author_url text,
    author_photo text,
    hidden boolean NOT NULL DEFAULT false,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    verified_at timestamp with time zone,
    UNIQUE (source, target)
  );`,

  `CREATE INDEX IF NOT EXISTS webmentions_target_slug_idx ON webmentions (target_slug);`,

  `CREATE TABLE IF NOT EXISTS ai_usage (
    date text NOT NULL,
    provider text NOT NULL,
    prompt_tokens integer NOT NULL DEFAULT 0,
    completion_tokens integer NOT NULL DEFAULT 0,
    total_tokens integer NOT NULL DEFAULT 0,
    requests integer NOT NULL DEFAULT 0,
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (date, provider)
  );`,

  `CREATE INDEX IF NOT EXISTS ai_usage_date_idx ON ai_usage (date DESC);`,

  `CREATE TABLE IF NOT EXISTS ai_custom_models (
    id text PRIMARY KEY,
    label text NOT NULL,
    hint text,
    protocol text NOT NULL DEFAULT 'openai',
    base_url text NOT NULL,
    upstream_id text NOT NULL,
    api_key text NOT NULL,
    extra_headers jsonb NOT NULL DEFAULT '{}'::jsonb,
    enabled boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
  );`,
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
