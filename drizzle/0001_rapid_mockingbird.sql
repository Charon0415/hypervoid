CREATE TYPE "public"."post_status" AS ENUM('draft', 'scheduled', 'published');--> statement-breakpoint
CREATE TABLE "posts" (
	"slug" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"content" text NOT NULL,
	"category" text,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"cover" text,
	"status" "post_status" DEFAULT 'draft' NOT NULL,
	"publish_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
