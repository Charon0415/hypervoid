export type MusicAlbum = {
  id: string;
  title: string;
  artist: string;
  year?: number;
  cover?: string;
  /** 平台外链：网易云/Spotify/Apple Music/Bandcamp 等 */
  link?: string;
  note?: string;
};

export type MusicPlaylist = {
  id: string;
  title: string;
  description?: string;
  link: string;
  platform: "netease" | "spotify" | "apple" | "youtube" | "bandcamp" | "other";
  trackCount?: number;
};

/**
 * 在循环听的专辑。空数组时页面会显示提示。
 */
export const ALBUMS_ON_REPEAT: MusicAlbum[] = [
  // 在这里填你最近循环的专辑。示例：
  // {
  //   id: "ok-computer",
  //   title: "OK Computer",
  //   artist: "Radiohead",
  //   year: 1997,
  //   cover: "/music/ok-computer.jpg",
  //   link: "https://music.163.com/album/...",
  //   note: "听了一百遍仍然能听出新东西。",
  // },
];

/**
 * 公开播放列表。这里放你愿意分享的歌单。
 */
export const PLAYLISTS: MusicPlaylist[] = [
  // {
  //   id: "late-night",
  //   title: "深夜代码",
  //   description: "凌晨两点写代码时的背景音。",
  //   link: "https://music.163.com/playlist?id=...",
  //   platform: "netease",
  //   trackCount: 42,
  // },
];

export const GENRES = [
  "Post-rock",
  "Ambient",
  "Shoegaze",
  "Indie folk",
  "Lo-fi",
  "Jazz",
  "Classical",
  "Electronic",
];
