import { NextResponse } from "next/server";
import { getSiteOverride } from "@/lib/site-config-server";
import { getPlaylistWithUrls } from "@/lib/ncm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url);
  let playlistId = searchParams.get("id");

  if (!playlistId) {
    playlistId = await getSiteOverride("music.playlistId");
  }

  if (!playlistId?.trim()) {
    return NextResponse.json(
      { error: "未配置歌单 ID" },
      { status: 400 },
    );
  }

  try {
    const tracks = await getPlaylistWithUrls(playlistId.trim());
    return NextResponse.json({ tracks }, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (e) {
    console.error("[music/playlist]", e instanceof Error ? e.name : "error");
    return NextResponse.json(
      { error: "获取歌单数据失败" },
      { status: 500 },
    );
  }
}
