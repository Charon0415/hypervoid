import { NextResponse } from "next/server";
import { getLyrics } from "@/lib/ncm";
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

export async function GET(req: Request): Promise<Response> {
  const rl = await rateLimit(getIp(req), {
    key: "music:lyrics",
    limit: 60,
    windowSec: 60,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: `请求过于频繁，请 ${rl.resetInSec} 秒后重试` },
      { status: 429 },
    );
  }

  const { searchParams } = new URL(req.url);
  const idRaw = searchParams.get("id");
  const id = idRaw ? Number(idRaw) : NaN;
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "缺少 id" }, { status: 400 });
  }

  try {
    const lines = await getLyrics(id);
    return NextResponse.json(
      { lines },
      {
        headers: {
          // Lyrics are essentially immutable for a given song id.
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
        },
      },
    );
  } catch (e) {
    console.error("[music/lyrics]", e instanceof Error ? e.name : "error");
    return NextResponse.json({ error: "获取歌词失败" }, { status: 502 });
  }
}
