import "server-only";

import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { siteConfig } from "@/lib/site-config";

export type OverridableFields =
  | "name"
  | "title"
  | "description"
  | "author.name"
  | "author.handle"
  | "author.bio"
  | "author.avatar"
  | "author.githubUsername"
  | "author.githubUrl"
  | "bangumiUserId"
  | "rss.title"
  | "rss.description"
  | "socials.github"
  | "socials.bilibili"
  | "socials.gitee"
  | "socials.codeberg"
  | "socials.steam"
  | "announcementMessage"
  | "announcementLink"
  | "announcementLinkText";

const DEFAULT_MAP: Record<OverridableFields, string> = {
  name: siteConfig.name,
  title: siteConfig.title,
  description: siteConfig.description,
  "author.name": siteConfig.author.name,
  "author.handle": siteConfig.author.handle,
  "author.bio": siteConfig.author.bio,
  "author.avatar": siteConfig.author.avatar,
  "author.githubUsername": siteConfig.author.githubUsername,
  "author.githubUrl": siteConfig.author.githubUrl,
  bangumiUserId: siteConfig.bangumiUserId,
  "rss.title": siteConfig.rss.title,
  "rss.description": siteConfig.rss.description,
  "socials.github": siteConfig.socials.find((s) => s.icon === "github")?.url ?? "",
  "socials.bilibili": siteConfig.socials.find((s) => s.icon === "bilibili")?.url ?? "",
  "socials.gitee": siteConfig.socials.find((s) => s.icon === "gitee")?.url ?? "",
  "socials.codeberg": siteConfig.socials.find((s) => s.icon === "codeberg")?.url ?? "",
  "socials.steam": siteConfig.socials.find((s) => s.icon === "steam")?.url ?? "",
  announcementMessage: "",
  announcementLink: "",
  announcementLinkText: "",
};

const LABELS: Record<OverridableFields, string> = {
  name: "站点名 (title suffix)",
  title: "SEO 标题",
  description: "站点描述",
  "author.name": "作者名",
  "author.handle": "显示用户名",
  "author.bio": "个人简介",
  "author.avatar": "头像路径",
  "author.githubUsername": "GitHub 用户名",
  "author.githubUrl": "GitHub 主页链接",
  bangumiUserId: "Bangumi 用户 ID",
  "rss.title": "RSS 标题",
  "rss.description": "RSS 描述",
  "socials.github": "GitHub Profile 链接",
  "socials.bilibili": "Bilibili 链接",
  "socials.gitee": "Gitee 链接",
  "socials.codeberg": "Codeberg 链接",
  "socials.steam": "Steam 链接",
  announcementMessage: "公告文本（留空则不显示）",
  announcementLink: "公告链接",
  announcementLinkText: "链接按钮文字",
};

export const OVERRIDABLE_FIELDS = Object.entries(LABELS).map(
  ([key, label]) => ({ key: key as OverridableFields, label }),
);

let _cache: Map<string, string> | null = null;
let _cacheTs = 0;

async function loadOverrides(): Promise<Map<string, string>> {
  const now = Date.now();
  if (_cache && now - _cacheTs < 60_000) return _cache;

  const rows = await getDb().select().from(schema.siteOverrides);
  _cache = new Map(rows.map((r) => [r.key, r.value]));
  _cacheTs = now;
  return _cache;
}

export async function getSiteOverride(key: OverridableFields): Promise<string> {
  const overrides = await loadOverrides();
  return overrides.get(key) ?? DEFAULT_MAP[key];
}

export async function getAllOverrides(): Promise<
  { key: OverridableFields; value: string; default: string }[]
> {
  const overrides = await loadOverrides();
  return OVERRIDABLE_FIELDS.map(({ key }) => ({
    key,
    value: overrides.get(key) ?? DEFAULT_MAP[key],
    default: DEFAULT_MAP[key],
  }));
}

export async function setSiteOverrides(
  entries: { key: OverridableFields; value: string }[],
): Promise<void> {
  const db = getDb();
  const now = new Date();
  for (const { key, value } of entries) {
    const trimmed = value.trim();
    if (!trimmed || trimmed === DEFAULT_MAP[key]) {
      await db
        .delete(schema.siteOverrides)
        .where(eq(schema.siteOverrides.key, key));
    } else {
      await db
        .insert(schema.siteOverrides)
        .values({ key, value: trimmed, updatedAt: now })
        .onConflictDoUpdate({
          target: schema.siteOverrides.key,
          set: { value: trimmed, updatedAt: now },
        });
    }
  }
  _cache = null;
}
