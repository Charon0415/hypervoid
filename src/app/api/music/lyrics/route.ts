import { NextResponse } from "next/server";
import { getLyrics } from "@/lib/ncm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request): Promise<Response> {
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
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      },
    );
  } catch (e) {
    console.error("[music/lyrics]", e instanceof Error ? e.name : "error");
    return NextResponse.json({ error: "获取歌词失败" }, { status: 500 });
  }
}
