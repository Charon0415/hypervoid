import "server-only";
import { siteConfig } from "@/lib/site-config";
import type { SteamGame } from "@/lib/steam-types";

export type { SteamGame } from "@/lib/steam-types";
export { formatHours } from "@/lib/steam-types";

const UA = `HyperCharon/hypervoid (+${siteConfig.url})`;

type RawGame = {
  appid: number;
  name: string;
  playtime_forever: number;
  playtime_2weeks?: number;
  img_icon_url?: string;
  has_community_visible_stats?: boolean;
};

type OwnedGamesResponse = {
  response?: {
    game_count?: number;
    games?: RawGame[];
  };
};

type ResolveVanityResponse = {
  response?: {
    steamid?: string;
    success?: number;
  };
};

function coverUrl(appId: number): string {
  return `https://cdn.cloudflare.steamstatic.com/steam/apps/${appId}/library_600x900.jpg`;
}

function iconUrl(appId: number, hash: string | undefined): string {
  if (!hash) return "";
  return `https://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${hash}.jpg`;
}

async function resolveVanity(
  apiKey: string,
  vanity: string,
): Promise<string | null> {
  const url = `https://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${apiKey}&vanityurl=${encodeURIComponent(vanity)}`;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as ResolveVanityResponse;
    if (json.response?.success === 1 && json.response.steamid) {
      return json.response.steamid;
    }
    return null;
  } catch {
    return null;
  }
}

async function getSteamId(): Promise<{ steamId: string; apiKey: string } | null> {
  const apiKey = process.env.STEAM_API_KEY?.trim();
  if (!apiKey) return null;

  const direct = process.env.STEAM_ID?.trim();
  if (direct && /^\d{17}$/.test(direct)) return { steamId: direct, apiKey };

  const vanity = process.env.STEAM_VANITY?.trim();
  if (vanity) {
    const resolved = await resolveVanity(apiKey, vanity);
    if (resolved) return { steamId: resolved, apiKey };
  }
  return null;
}

export async function fetchOwnedGames(): Promise<{
  games: SteamGame[];
  total: number;
}> {
  const creds = await getSteamId();
  if (!creds) return { games: [], total: 0 };

  const { apiKey, steamId } = creds;
  const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${apiKey}&steamid=${steamId}&include_appinfo=1&include_played_free_games=1&format=json`;

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": UA },
      next: { revalidate: 7200 },
    });
    if (!res.ok) {
      console.error(`[steam] owned games fetch failed: ${res.status}`);
      return { games: [], total: 0 };
    }
    const json = (await res.json()) as OwnedGamesResponse;
    const raw = json.response?.games ?? [];
    return {
      total: json.response?.game_count ?? raw.length,
      games: raw.map((g) => ({
        appId: g.appid,
        name: g.name,
        cover: coverUrl(g.appid),
        iconUrl: iconUrl(g.appid, g.img_icon_url),
        playtimeForeverMin: g.playtime_forever ?? 0,
        playtimeRecentMin: g.playtime_2weeks ?? 0,
        hasCommunityVisibleStats: g.has_community_visible_stats === true,
      })),
    };
  } catch (e) {
    console.error("[steam] fetch error", e);
    return { games: [], total: 0 };
  }
}
