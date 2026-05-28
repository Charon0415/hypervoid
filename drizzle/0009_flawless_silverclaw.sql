CREATE TABLE "ai_custom_models" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"hint" text,
	"protocol" text DEFAULT 'openai' NOT NULL,
	"base_url" text NOT NULL,
	"upstream_id" text NOT NULL,
	"api_key" text NOT NULL,
	"extra_headers" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ai_usage" (
	"date" text NOT NULL,
	"provider" text NOT NULL,
	"prompt_tokens" integer DEFAULT 0 NOT NULL,
	"completion_tokens" integer DEFAULT 0 NOT NULL,
	"total_tokens" integer DEFAULT 0 NOT NULL,
	"requests" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ai_usage_date_provider_pk" PRIMARY KEY("date","provider")
);
--> statement-breakpoint
CREATE TABLE "db_backups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"pathname" text NOT NULL,
	"size_bytes" integer DEFAULT 0 NOT NULL,
	"table_counts" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "link_checks" (
	"url" text PRIMARY KEY NOT NULL,
	"status" integer,
	"error_message" text,
	"post_slugs" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"last_checked_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "post_reactions" (
	"slug" text NOT NULL,
	"emoji" text NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "post_reactions_slug_emoji_pk" PRIMARY KEY("slug","emoji")
);
--> statement-breakpoint
CREATE TABLE "rate_limits" (
	"key" text NOT NULL,
	"identifier" text NOT NULL,
	"window_start" timestamp with time zone DEFAULT now() NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "rate_limits_key_identifier_pk" PRIMARY KEY("key","identifier")
);
--> statement-breakpoint
CREATE TABLE "resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"url" text NOT NULL,
	"category" text DEFAULT '其他' NOT NULL,
	"icon" text,
	"hidden" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "search_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"query" text NOT NULL,
	"result_count" integer DEFAULT 0 NOT NULL,
	"ip_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "series" (
	"slug" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"cover" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visitor_logins" (
	"github_login" text PRIMARY KEY NOT NULL,
	"github_name" text,
	"avatar_url" text,
	"login_count" integer DEFAULT 0 NOT NULL,
	"first_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "webmentions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"source" text NOT NULL,
	"target" text NOT NULL,
	"target_slug" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"type" text DEFAULT 'mention' NOT NULL,
	"content" text,
	"author_name" text,
	"author_url" text,
	"author_photo" text,
	"hidden" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"verified_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "albums" ADD COLUMN "display_mode" text DEFAULT 'wall' NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "word_count" integer DEFAULT 0 NOT NULL;