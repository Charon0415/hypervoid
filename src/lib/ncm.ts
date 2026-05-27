import "server-only";

/**
 * Lightweight NetEase Cloud Music API client.
 * Calls NCM's internal web API directly — no third-party package needed.
 *
 * Playlist metadata and lyrics are small JSON calls. Audio playback uses a
 * local stream endpoint that resolves fresh NCM URLs server-side and forwards
 * range requests so browser playback is less likely to fail on expired direct
 * links, CORS, or referrer checks.
 */

const BASE = "https://music.163.com";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

/**
 * Normalize whatever the user pasted into NCM_COOKIE so common copy-paste
 * mistakes (header prefix, wrapped quotes, stray newlines) don't break the
 * upstream request silently.
 */
function getCookie(): string | undefined {
  let v = process.env.NCM_COOKIE;
  if (!v) return undefined;
  v = v.trim();
  // Strip "Cookie:" prefix if pasted from devtools' Headers panel.
  if (/^cookie:\s*/i.test(v)) v = v.replace(/^cookie:\s*/i, "");
  // Strip wrapping quotes that some env-var UIs add.
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  v = v.replace(/[\r\n]/g, "");
  return v.trim() || undefined;
}

export function ncmMediaHeaders(): Record<string, string> {
  const h: Record<string, string> = {
    "User-Agent": UA,
    Referer: BASE,
    Origin: BASE,
  };
  const cookie = getCookie();
  if (cookie) h.Cookie = cookie;
  return h;
}

function headers(): Record<string, string> {
  return {
    ...ncmMediaHeaders(),
    "Content-Type": "application/x-www-form-urlencoded",
  };
}

/**
 * NCM API returns HTTP 200 even on logical errors, with `{code, message}` in
 * the body. Treat anything other than `code === 200` as a failure so the
 * caller surfaces a useful error instead of silently returning empty data.
 */
function assertNcmOk(
  data: unknown,
  ctx: string,
): asserts data is Record<string, unknown> {
  if (!data || typeof data !== "object") {
    throw new Error(`NCM ${ctx}: malformed response`);
  }
  const d = data as { code?: number; message?: string };
  if (typeof d.code === "number" && d.code !== 200) {
    throw new Error(`NCM ${ctx}: code=${d.code} ${d.message ?? ""}`);
  }
}

export function ncmCookieConfigured(): boolean {
  return Boolean(getCookie());
}

export type NcmTrack = {
  id: number;
  title: string;
  artist: string;
  cover: string;
  duration: number; // ms
};

export type NcmTrackWithUrl = NcmTrack & { url: string | null };

export type NcmPlaylistMeta = {
  id: string;
  name: string;
  cover: string;
  trackCount: number;
  description: string;
  creator: string;
};

/**
 * Fetch a playlist's metadata (name/cover/trackCount/description) without
 * pulling the full track list. Throws on network errors or invalid IDs.
 */
export async function getPlaylistMeta(
  playlistId: string,
): Promise<NcmPlaylistMeta> {
  const res = await fetch(`${BASE}/api/v6/playlist/detail`, {
    method: "POST",
    headers: headers(),
    body: `id=${encodeURIComponent(playlistId)}&n=0&s=0`,
    next: { revalidate: 600 },
  });

  if (!res.ok) throw new Error(`NCM playlist HTTP ${res.status}`);
  const data = await res.json();
  assertNcmOk(data, `playlist ${playlistId}`);
  const p = (data as { playlist?: Record<string, unknown> }).playlist;
  if (!p || typeof p.id === "undefined") {
    throw new Error("NCM playlist not found");
  }

  const rawCover = (p.coverImgUrl as string | undefined) || (p.picUrl as string | undefined);
  const creator = p.creator as { nickname?: string } | undefined;
  return {
    id: String(p.id),
    name: String(p.name ?? "未命名歌单"),
    cover: rawCover ? `${rawCover}?param=300y300` : "",
    trackCount: Number(p.trackCount ?? 0),
    description: String(p.description ?? ""),
    creator: String(creator?.nickname ?? ""),
  };
}

/**
 * Parse a raw NCM track object into our NcmTrack shape.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseNcmTrack(t: any): NcmTrack {
  return {
    id: t.id,
    title: t.name,
    artist: (t.ar || []).map((a: { name: string }) => a.name).join(" / "),
    cover: t.al?.picUrl ? `${t.al.picUrl}?param=300y300` : "",
    duration: t.dt || 0,
  };
}

const SONG_DETAIL_BATCH = 1000;

/**
 * Fetch full track details for a list of song IDs in batches via
 * `/api/v3/song/detail`. Used when the playlist detail endpoint only returns
 * trackIds (large playlists) instead of full track objects.
 */
async function getTracksByIds(ids: number[]): Promise<NcmTrack[]> {
  const tracks: NcmTrack[] = [];
  for (let i = 0; i < ids.length; i += SONG_DETAIL_BATCH) {
    const batch = ids.slice(i, i + SONG_DETAIL_BATCH);
    const c = JSON.stringify(batch.map((id) => ({ id })));
    const url = `${BASE}/api/v3/song/detail?c=${encodeURIComponent(c)}`;
    const res = await fetch(url, {
      method: "GET",
      headers: headers(),
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      console.warn(`[NCM] song detail batch HTTP ${res.status}`);
      continue;
    }
    const data = await res.json();
    if (data?.songs) {
      for (const s of data.songs) tracks.push(parseNcmTrack(s));
    }
  }
  return tracks;
}

/**
 * Get all tracks from a playlist.
 *
 * NCM's playlist detail endpoint only returns full track objects for the first
 * ~1000 entries. For larger playlists the response contains `trackIds` with the
 * complete list — we use that to fetch the remaining tracks via
 * `/api/v3/song/detail` in batches.
 */
export async function getPlaylistTracks(
  playlistId: string,
): Promise<NcmTrack[]> {
  const res = await fetch(`${BASE}/api/v6/playlist/detail`, {
    method: "POST",
    headers: headers(),
    body: `id=${encodeURIComponent(playlistId)}&n=100000&s=0`,
    next: { revalidate: 300 },
  });

  if (!res.ok) throw new Error(`NCM playlist HTTP ${res.status}`);
  const data = await res.json();
  assertNcmOk(data, `playlist ${playlistId}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const playlist = (data as any).playlist;
  if (!playlist) throw new Error("NCM no playlist");

  // tracks may be absent for very large playlists; trackIds is always present.
  const rawTracks: unknown[] = playlist.tracks ?? [];
  const trackIds: number[] = (playlist.trackIds ?? []).map(
    (t: { id: number }) => t.id,
  );

  // If the detail endpoint returned all tracks (common for small playlists),
  // we're done.
  if (rawTracks.length >= trackIds.length) {
    return rawTracks.map(parseNcmTrack);
  }

  // Otherwise, parse what we have and fetch the rest by ID.
  const partial = rawTracks.map(parseNcmTrack);
  const haveIds = new Set(partial.map((t) => t.id));
  const missingIds = trackIds.filter((id) => !haveIds.has(id));

  if (missingIds.length > 0) {
    const extra = await getTracksByIds(missingIds);
    // Preserve the original trackIds order by building a lookup map.
    const lookup = new Map<number, NcmTrack>();
    for (const t of partial) lookup.set(t.id, t);
    for (const t of extra) lookup.set(t.id, t);
    return trackIds.map((id) => lookup.get(id)).filter(Boolean) as NcmTrack[];
  }

  return partial;
}

const URL_BATCH_SIZE = 100;

/**
 * Get playable audio URLs for a list of song IDs.
 *
 * NCM's URL endpoint silently drops IDs beyond a certain batch size (~100),
 * so we split large requests into parallel batches.
 */
async function fetchSongUrlBatch(
  batch: number[],
  level: string,
): Promise<{ id: number; url: string | null }[]> {
  const res = await fetch(BASE + "/api/song/enhance/player/url/v1", {
    method: "POST",
    headers: headers(),
    body:
      "ids=" +
      encodeURIComponent(JSON.stringify(batch)) +
      "&level=" +
      encodeURIComponent(level) +
      "&encodeType=mp3",
    next: { revalidate: 120 },
  });
  if (!res.ok) {
    console.warn("[NCM] song urls HTTP " + res.status);
    return [];
  }
  const data = await res.json();
  if (data?.code && data.code !== 200) {
    console.warn(
      "[NCM] song urls code=" +
        data.code +
        " message=" +
        (data.message ?? ""),
    );
  }
  return (data?.data ?? []) as { id: number; url: string | null }[];
}

export async function getSongUrls(
  ids: number[],
): Promise<Map<number, string | null>> {
  const map = new Map<number, string | null>();
  if (ids.length === 0) return map;

  const batches: number[][] = [];
  for (let i = 0; i < ids.length; i += URL_BATCH_SIZE) {
    batches.push(ids.slice(i, i + URL_BATCH_SIZE));
  }

  const levels = ["exhigh", "higher", "standard"];
  await Promise.all(
    batches.map(async (batch) => {
      const unresolved = new Set(batch);
      for (const level of levels) {
        if (unresolved.size === 0) break;
        const items = await fetchSongUrlBatch([...unresolved], level);
        for (const d of items) {
          if (!unresolved.has(d.id)) continue;
          if (d.url) {
            map.set(d.id, d.url);
            unresolved.delete(d.id);
          }
        }
      }
      for (const id of unresolved) map.set(id, null);
    }),
  );

  return map;
}

async function getOuterSongUrl(songId: number): Promise<string | null> {
  const res = await fetch(
    BASE + "/song/media/outer/url?id=" + encodeURIComponent(String(songId)) + ".mp3",
    {
      method: "HEAD",
      headers: ncmMediaHeaders(),
      redirect: "manual",
      cache: "no-store",
    },
  ).catch(() => null);
  if (!res) return null;
  const location = res.headers.get("location");
  if (!location || /\/404(?:$|[?#])/i.test(location)) return null;
  return location;
}

export async function getPlayableSongUrl(songId: number): Promise<string | null> {
  const urls = await getSongUrls([songId]);
  return urls.get(songId) ?? (await getOuterSongUrl(songId));
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
    url: urlMap.get(t.id) ? `/api/music/stream?id=${t.id}` : null,
  }));
}

export type LyricLine = { t: number; text: string };

/**
 * Get lyrics for a song. Returns time-tagged lines parsed from LRC.
 * Lines without timestamps (or lyrics-not-available responses) yield an
 * empty array.
 */
export async function getLyrics(songId: number): Promise<LyricLine[]> {
  const res = await fetch(
    `${BASE}/api/song/lyric?os=pc&id=${songId}&lv=-1&kv=-1&tv=-1`,
    {
      method: "GET",
      headers: headers(),
      // Lyrics almost never change for a given song id, so 1 day is safe.
      next: { revalidate: 86400 },
    },
  );

  if (!res.ok) {
    console.warn(`[NCM] lyrics HTTP ${res.status}`);
    return [];
  }
  const data = await res.json();
  if (data?.code && data.code !== 200) {
    console.warn(`[NCM] lyrics code=${data.code} for song ${songId}`);
    return [];
  }
  const lrc: string | undefined = data?.lrc?.lyric;
  if (!lrc) return [];
  return parseLrc(lrc);
}

function parseLrc(lrc: string): LyricLine[] {
  const out: LyricLine[] = [];
  // Matches [mm:ss.xx] or [mm:ss] at the start of each timestamp tag.
  // A single line can carry multiple timestamps (e.g. "[00:01.00][00:30.00]text").
  const tagRe = /\[(\d+):(\d+)(?:[.:](\d+))?\]/g;
  for (const rawLine of lrc.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    const tags: number[] = [];
    let lastEnd = 0;
    tagRe.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = tagRe.exec(line)) !== null) {
      const min = Number(m[1]);
      const sec = Number(m[2]);
      const fracRaw = m[3] ?? "0";
      const frac = Number(fracRaw.padEnd(3, "0").slice(0, 3)) / 1000;
      tags.push(min * 60_000 + sec * 1000 + Math.round(frac * 1000));
      lastEnd = tagRe.lastIndex;
    }
    if (tags.length === 0) continue;
    const text = line.slice(lastEnd).trim();
    if (!text) continue; // skip metadata-only lines like [ti:...]
    for (const t of tags) out.push({ t, text });
  }
  out.sort((a, b) => a.t - b.t);
  return out;
}
