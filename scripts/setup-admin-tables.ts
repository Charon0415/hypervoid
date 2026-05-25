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
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
  );`,

  // v1.7 → v1.8: the per-row "enabled" toggle was confusing alongside
  // the model-picker radio (both were called "启用"), so the UI dropped
  // it. The column gets removed too to keep schema and code aligned.
  `ALTER TABLE ai_custom_models DROP COLUMN IF EXISTS enabled;`,

  // Hot-path indexes — every list page filters posts by (status, visibility,
  // publish_at) and orders by (pinned desc, publish_at desc). Without these,
  // Neon does a full table scan; with them, the planner can hit a covered
  // bitmap. Indexes are idempotent so re-runs are safe.
  `CREATE INDEX IF NOT EXISTS posts_status_visibility_publish_idx
    ON posts (status, visibility, publish_at DESC NULLS LAST);`,
  `CREATE INDEX IF NOT EXISTS posts_pinned_publish_idx
    ON posts (pinned DESC, publish_at DESC NULLS LAST, created_at DESC);`,

  // Guestbook public list: WHERE hidden=false ORDER BY created_at DESC.
  `CREATE INDEX IF NOT EXISTS guestbook_hidden_created_idx
    ON guestbook_messages (hidden, created_at DESC);`,

  // Webmentions public list: WHERE target_slug=$1 AND status='verified' AND hidden=false.
  // The existing target_slug-only index can't cover the status/hidden filter.
  `CREATE INDEX IF NOT EXISTS webmentions_target_status_hidden_idx
    ON webmentions (target_slug, status, hidden);`,

  // post_reactions PK is (slug, emoji) which is fine for slug-prefix queries,
  // but standalone slug filters benefit from a slimmer secondary index.
  `CREATE INDEX IF NOT EXISTS post_reactions_slug_idx
    ON post_reactions (slug);`,

  // Precomputed word_count on posts so list pages don't have to load the
  // full content column just to display "X 字". Estimate: CJK chars count
  // 1, runs of latin word chars count as 1. Backfill is best-effort.
  `ALTER TABLE posts ADD COLUMN IF NOT EXISTS word_count integer NOT NULL DEFAULT 0;`,
  `UPDATE posts SET word_count = (
    coalesce(array_length(regexp_split_to_array(content, '[\\u4e00-\\u9fff]'), 1), 1) - 1
    + coalesce(array_length(regexp_split_to_array(regexp_replace(content, '[\\u4e00-\\u9fff]', '', 'g'), '\\s+'), 1), 1)
  )
  WHERE word_count = 0;`,

  // Cross-Lambda rate limit. The in-memory Map version was reset every
  // cold start and unique per container; this row-per-(key,identifier)
  // version is shared across instances.
  `CREATE TABLE IF NOT EXISTS rate_limits (
    key text NOT NULL,
    identifier text NOT NULL,
    window_start timestamp with time zone NOT NULL DEFAULT now(),
    count integer NOT NULL DEFAULT 0,
    PRIMARY KEY (key, identifier)
  );`,
  `CREATE INDEX IF NOT EXISTS rate_limits_window_idx
    ON rate_limits (window_start);`,
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
