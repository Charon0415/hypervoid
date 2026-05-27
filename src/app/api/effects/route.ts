import { NextResponse } from "next/server";
import { getSiteOverride } from "@/lib/site-config-server";

export const runtime = "nodejs";

export async function GET() {
  const [playerWidget, particles, glow] = await Promise.all([
    getSiteOverride("effects.playerWidget"),
    getSiteOverride("effects.particles"),
    getSiteOverride("effects.glow"),
  ]);

  return NextResponse.json(
    {
      playerWidget: playerWidget === "on",
      particles: particles === "on",
      glow: glow === "on",
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
