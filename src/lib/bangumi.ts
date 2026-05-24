import "server-only";
import { siteConfig } from "@/lib/site-config";
import {
  STATUS_TO_TYPE,
  SUBJECT_KIND_TO_TYPE,
  type BangumiAnime,
  type BangumiItem,
  type BangumiStatus,
  type BangumiSubjectKind,
} from "@/lib/bangumi-types";

export type {
  BangumiAnime,
  BangumiItem,
  BangumiStatus,
  BangumiSubjectKind,
} from "@/lib/bangumi-types";
export {
  STATUS_LABEL,
  STATUS_LABEL_BOOK,
  STATUS_TO_TYPE,
  SUBJECT_KIND_TO_TYPE,
} from "@/lib/bangumi-types";

type RawCollection = {
  data: Array<{
    updated_at: string;
    rate: number;
    ep_status: number;
    subject_id: number;
    subject: {
      id: number;
      name: string;
      name_cn: string | null;
      date: string | null;
      eps: number;
      images: { common?: string; large?: string; medium?: string };
      rating: { score: number; total: number };
    };
  }>;
  total: number;
};

const UA = `HyperCharon/hypervoid (+${siteConfig.url})`;

export async function fetchBangumiCollection(
  kind: BangumiSubjectKind,
  status: BangumiStatus,
  { limit = 50, offset = 0 }: { limit?: number; offset?: number } = {},
): Promise<{ items: BangumiItem[]; total: number }> {
  const userId = siteConfig.bangumiUserId;
  if (!userId) return { items: [], total: 0 };

  const subjectType = SUBJECT_KIND_TO_TYPE[kind];
  const type = STATUS_TO_TYPE[status];
  const url = `https://api.bgm.tv/v0/users/${userId}/collections?subject_type=${subjectType}&type=${type}&limit=${limit}&offset=${offset}`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.error(
        `[bangumi] ${kind}/${status} fetch failed: ${res.status}`,
      );
      return { items: [], total: 0 };
    }
    const json = (await res.json()) as RawCollection;
    return {
      total: json.total,
      items: json.data.map((row) => ({
        id: row.subject.id,
        status,
        kind,
        name: row.subject.name,
        nameCn: row.subject.name_cn || null,
        date: row.subject.date || null,
        cover:
          row.subject.images.common ||
          row.subject.images.medium ||
          row.subject.images.large ||
          null,
        myRating: row.rate,
        bgmScore: row.subject.rating?.score ?? null,
        bgmRaters: row.subject.rating?.total ?? 0,
        epStatus: row.ep_status,
        totalEps: row.subject.eps,
        updatedAt: row.updated_at,
        url: `https://bgm.tv/subject/${row.subject.id}`,
      })),
    };
  } catch (e) {
    console.error("[bangumi] fetch error", e);
    return { items: [], total: 0 };
  }
}

/** Backwards-compatible anime-only wrapper. */
export async function fetchBangumiAnime(
  status: BangumiStatus,
  opts: { limit?: number; offset?: number } = {},
): Promise<{ items: BangumiAnime[]; total: number }> {
  return fetchBangumiCollection("anime", status, opts);
}

export async function fetchAllForKind(kind: BangumiSubjectKind): Promise<{
  watching: { items: BangumiItem[]; total: number };
  done: { items: BangumiItem[]; total: number };
  wish: { items: BangumiItem[]; total: number };
  onhold: { items: BangumiItem[]; total: number };
  dropped: { items: BangumiItem[]; total: number };
}> {
  const [watching, done, wish, onhold, dropped] = await Promise.all([
    fetchBangumiCollection(kind, "watching", { limit: 50 }),
    fetchBangumiCollection(kind, "done", { limit: 100 }),
    fetchBangumiCollection(kind, "wish", { limit: 50 }),
    fetchBangumiCollection(kind, "onhold", { limit: 30 }),
    fetchBangumiCollection(kind, "dropped", { limit: 30 }),
  ]);
  return { watching, done, wish, onhold, dropped };
}

export async function fetchAllAnime() {
  return fetchAllForKind("anime");
}
