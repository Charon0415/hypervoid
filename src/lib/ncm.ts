import "server-only";

/**
 * Lightweight NetEase Cloud Music API client.
 * Calls NCM's internal web API directly — no third-party package needed.
 *
 * Audio bytes are NEVER proxied through this server: the `<audio>` element
 * loads URLs directly from NCM's CDN, so Vercel bandwidth/storage is
 * unaffected by playback. We only proxy small JSON (playlist meta, song
 * url metadata, lyrics).
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

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    "User-Agent": UA,
    Referer: BASE,
    Origin: BASE,
    "Content-Type": "application/x-www-form-urlencoded",
  };
  const cookie = getCookie();
  if (cookie) h.Cookie = cookie;
  return h;
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
 * Get all tracks from a playlist.
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
  const playlist = (data as { playlist?: { tracks?: unknown[] } }).playlist;
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

  // NCM CDN URLs typically expire in ~20 min; cache for 5 to balance refresh
  // and load.
  const res = await fetch(`${BASE}/api/song/enhance/player/url/v1`, {
    method: "POST",
    headers: headers(),
    body: `ids=${JSON.stringify(ids)}&level=exhigh&encodeType=flac`,
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    console.warn(`[NCM] song urls HTTP ${res.status}`);
    return map;
  }
  const data = await res.json();
  // Logical-error: returns code !== 200 (often happens without a valid cookie)
  if (data?.code && data.code !== 200) {
    console.warn(`[NCM] song urls code=${data.code} message=${data.message ?? ""}`);
  }
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
