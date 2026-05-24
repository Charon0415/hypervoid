export type BangumiStatus =
  | "wish"
  | "done"
  | "watching"
  | "onhold"
  | "dropped";

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
  status: BangumiStatus;
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
