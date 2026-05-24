import "server-only";

import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import { siteConfig } from "@/lib/site-config";

export type OverridableFields =
  | "author.name"
  | "author.handle"
  | "author.bio"
  | "author.avatar"
  | "author.githubUsername"
  | "author.githubUrl"
  | "description"
  | "bangumiUserId";

const DEFAULT_MAP: Record<OverridableFields, string> = {
  "author.name": siteConfig.author.name,
  "author.handle": siteConfig.author.handle,
  "author.bio": siteConfig.author.bio,
  "author.avatar": siteConfig.author.avatar,
  "author.githubUsername": siteConfig.author.githubUsername,
  "author.githubUrl": siteConfig.author.githubUrl,
  "description": siteConfig.description,
  "bangumiUserId": siteConfig.bangumiUserId,
};

const LABELS: Record<OverridableFields, string> = {
  "author.name": "作者名",
  "author.handle": "GitHub 用户名",
  "author.bio": "个人简介",
  "author.avatar": "头像路径",
  "author.githubUsername": "GitHub 用户名",
  "author.githubUrl": "GitHub 链接",
  "description": "站点描述",
  "bangumiUserId": "Bangumi 用户 ID",
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
