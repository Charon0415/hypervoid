import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const postStatus = pgEnum("post_status", [
  "draft",
  "scheduled",
  "published",
]);

export const posts = pgTable("posts", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  category: text("category"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  cover: text("cover"),
  status: postStatus("status").notNull().default("draft"),
  publishAt: timestamp("publish_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const postViews = pgTable("post_views", {
  slug: text("slug").primaryKey(),
  count: integer("count").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const postLikes = pgTable("post_likes", {
  slug: text("slug").primaryKey(),
  count: integer("count").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
