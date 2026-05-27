export type MusicTrack = {
  id: number;
  title: string;
  artist: string;
  cover: string;
  duration: number;
  url: string | null;
  lrc?: string;
};
