export type BangumiStatus =
  | "wish"
  | "done"
  | "watching"
  | "onhold"
  | "dropped";

export type BangumiSubjectKind = "anime" | "book" | "real";

export const SUBJECT_KIND_TO_TYPE: Record<BangumiSubjectKind, number> = {
  book: 1,
  anime: 2,
  real: 6,
};

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

export const STATUS_LABEL_BOOK: Record<BangumiStatus, string> = {
  watching: "在读",
  done: "读过",
  wish: "想读",
  onhold: "搁置",
  dropped: "弃读",
};

export type BangumiItem = {
  id: number;
  status: BangumiStatus;
  kind: BangumiSubjectKind;
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

/** Legacy alias for the original anime-only callsites. */
export type BangumiAnime = BangumiItem;

