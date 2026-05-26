import { NextResponse } from "next/server";
import { getSiteOverride } from "@/lib/site-config-server";
import { getPlaylistWithUrls } from "@/lib/ncm";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// `id` from the query string is intentionally ignored — clients always get
// the playlist the admin selected. This keeps the endpoint from being used
// as a free NCM proxy by external callers.
export async function GET(req: Request): Promise<Response> {
  const rl = await rateLimit(getIp(req), {
    key: "music:playlist",
    limit: 30,
    windowSec: 60,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: `请求过于频繁，请 ${rl.resetInSec} 秒后重试` },
      { status: 429 },
    );
  }

  const playlistId = (await getSiteOverride("music.playlistId")).trim();
  if (!playlistId) {
    return NextResponse.json(
      { error: "未配置歌单 ID（去 /admin/music 添加并设为当前）" },
      { status: 400 },
    );
  }

  try {
    const tracks = await getPlaylistWithUrls(playlistId);
    return NextResponse.json(
      { tracks },
      {
        headers: {
          // Short CDN cache + long SWR — keeps NCM upstream from being hit
          // by every visitor while still surfacing admin changes within a
          // few minutes.
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=1800",
        },
      },
    );
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    console.error(`[music/playlist] ${msg}`);
    return NextResponse.json(
      { error: `获取歌单数据失败：${msg}` },
      { status: 502 },
    );
  }
}
