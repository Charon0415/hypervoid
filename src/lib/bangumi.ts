import "server-only";
import { siteConfig } from "@/lib/site-config";

export type BangumiStatus = "wish" | "done" | "watching" | "onhold" | "dropped";

export const STATUS_TO_TYPE: Record<BangumiStatus, number> = {
  wish: 1,
  done: 2,
  watching: 3,
  onhold: 4,
  dropped: 5,
};

export const STATUS_LABEL: Record<BangumiStatus, string> = {
  watching: "在看",
  done: "看过",
  wish: "想看",
  onhold: "搁置",
  dropped: "抛弃",
};

export type BangumiAnime = {
  id: number;
  name: string;
  nameCn: string | null;
  date: string | null;
  cover: string | null;
  myRating: number;
  bgmScore: number | null;
  bgmRaters: number;
  epStatus: number;
  totalEps: number;
  updatedAt: string;
  url: string;
};

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

export async function fetchBangumiAnime(
  status: BangumiStatus,
  { limit = 50, offset = 0 }: { limit?: number; offset?: number } = {},
): Promise<{ items: BangumiAnime[]; total: number }> {
  const userId = siteConfig.bangumiUserId;
  if (!userId) return { items: [], total: 0 };

  const type = STATUS_TO_TYPE[status];
  const url = `https://api.bgm.tv/v0/users/${userId}/collections?subject_type=2&type=${type}&limit=${limit}&offset=${offset}`;

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": UA,
        Accept: "application/json",
      },
      next: { revalidate: 3600 },
    });
    if (!res.ok) {
      console.error(`[bangumi] ${status} fetch failed: ${res.status}`);
      return { items: [], total: 0 };
    }
    const json = (await res.json()) as RawCollection;
    return {
      total: json.total,
      items: json.data.map((row) => ({
        id: row.subject.id,
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
