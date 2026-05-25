import {
  boolean,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const postStatus = pgEnum("post_status", [
  "draft",
  "scheduled",
  "published",
]);

export const postVisibility = pgEnum("post_visibility", [
  "public",
  "private",
]);

export const announcementSlot = pgEnum("announcement_slot", [
  "top",
  "sidebar",
  "article_top",
]);

export const posts = pgTable("posts", {
  slug: text("slug").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  category: text("category"),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  cover: text("cover"),
  summary: text("summary"),
  pinned: boolean("pinned").notNull().default(false),
  status: postStatus("status").notNull().default("draft"),
  visibility: postVisibility("visibility").notNull().default("public"),
  series: text("series"),
  seriesOrder: integer("series_order"),
  publishAt: timestamp("publish_at", { withTimezone: true }),
  notifiedAt: timestamp("notified_at", { withTimezone: true }),
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

export const subscribers = pgTable("subscribers", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  verified: boolean("verified").notNull().default(false),
  verifyToken: text("verify_token").notNull(),
  unsubscribeToken: text("unsubscribe_token").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
});

export const friends = pgTable("friends", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  avatar: text("avatar"),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const guestbookMessages = pgTable("guestbook_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  githubLogin: text("github_login").notNull(),
  githubName: text("github_name"),
  avatarUrl: text("avatar_url"),
  message: text("message").notNull(),
  hidden: boolean("hidden").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const albums = pgTable("albums", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  description: text("description"),
  coverUrl: text("cover_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const photos = pgTable("photos", {
  id: uuid("id").primaryKey().defaultRandom(),
  albumId: uuid("album_id").references(() => albums.id, {
    onDelete: "cascade",
  }),
  url: text("url").notNull(),
  caption: text("caption"),
  takenAt: timestamp("taken_at", { withTimezone: true }),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Runtime overrides for site-config.ts — editable from /admin/settings */
export const siteOverrides = pgTable("site_overrides", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Custom theme — single-row table (id=1) holding light + dark color JSON */
export const customTheme = pgTable("custom_theme", {
  id: integer("id").primaryKey().default(1),
  enabled: boolean("enabled").notNull().default(false),
  light: jsonb("light").$type<Record<string, string>>().notNull().default({}),
  dark: jsonb("dark").$type<Record<string, string>>().notNull().default({}),
  wallpaperDesktop: text("wallpaper_desktop"),
  wallpaperMobile: text("wallpaper_mobile"),
  wallpaperOpacity: integer("wallpaper_opacity").notNull().default(100),
  wallpaperBlur: integer("wallpaper_blur").notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Slot-aware announcements with time-window and priority */
export const announcements = pgTable("announcements", {
  id: uuid("id").primaryKey().defaultRandom(),
  slot: announcementSlot("slot").notNull(),
  message: text("message").notNull(),
  link: text("link"),
  linkText: text("link_text"),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  priority: integer("priority").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Short-link redirects — /r/<code> → toUrl, with hit counter */
export const redirects = pgTable("redirects", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  toUrl: text("to_url").notNull(),
  note: text("note"),
  hits: integer("hits").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

/** Append-only audit log of admin actions */
export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  actor: text("actor").notNull(),
  action: text("action").notNull(),
  targetType: text("target_type"),
  targetId: text("target_id"),
  details: jsonb("details").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
