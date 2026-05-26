import "server-only";

/**
 * Lightweight NetEase Cloud Music API client.
 * Calls NCM's internal web API directly — no third-party package needed.
 */

const BASE = "https://music.163.com";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    "User-Agent": UA,
    Referer: BASE,
    Origin: BASE,
    "Content-Type": "application/x-www-form-urlencoded",
  };
  const cookie = process.env.NCM_COOKIE;
  if (cookie) h.Cookie = cookie;
  return h;
}

export type NcmTrack = {
  id: number;
  title: string;
  artist: string;
  cover: string;
  duration: number; // ms
};

export type NcmTrackWithUrl = NcmTrack & { url: string | null };

/**
 * Get all tracks from a playlist.
 */
export async function getPlaylistTracks(
  playlistId: string,
): Promise<NcmTrack[]> {
  const res = await fetch(`${BASE}/api/v6/playlist/detail`, {
    method: "POST",
    headers: headers(),
    body: `id=${playlistId}&n=100000&s=0`,
    next: { revalidate: 300 },
  });

  if (!res.ok) throw new Error(`NCM playlist ${res.status}`);
  const data = await res.json();
  const playlist = data?.playlist;
  if (!playlist?.tracks) throw new Error("NCM no tracks");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return playlist.tracks.map((t: any) => ({
    id: t.id,
    title: t.name,
    artist: (t.ar || []).map((a: { name: string }) => a.name).join(" / "),
    cover: t.al?.picUrl ? `${t.al.picUrl}?param=300y300` : "",
    duration: t.dt || 0,
  }));
}

/**
 * Get playable audio URLs for a list of song IDs.
 */
export async function getSongUrls(
  ids: number[],
): Promise<Map<number, string | null>> {
  const map = new Map<number, string | null>();
  if (ids.length === 0) return map;

  const res = await fetch(`${BASE}/api/song/enhance/player/url/v1`, {
    method: "POST",
    headers: headers(),
    body: `ids=${JSON.stringify(ids)}&level=exhigh&encodeType=flac`,
    next: { revalidate: 300 },
  });

  if (!res.ok) return map;
  const data = await res.json();
  if (data?.data) {
    for (const d of data.data as { id: number; url: string | null }[]) {
      map.set(d.id, d.url || null);
    }
  }
  return map;
}

/**
 * Get playlist tracks with playable URLs.
 */
export async function getPlaylistWithUrls(
  playlistId: string,
): Promise<NcmTrackWithUrl[]> {
  const tracks = await getPlaylistTracks(playlistId);
  const ids = tracks.map((t) => t.id);
  const urlMap = await getSongUrls(ids);
  return tracks.map((t) => ({
    ...t,
    url: urlMap.get(t.id) ?? null,
  }));
}
