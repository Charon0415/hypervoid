import { NextResponse } from "next/server";
import { getSiteOverride } from "@/lib/site-config-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const character = await getSiteOverride("mascot.character");
  return NextResponse.json({
    character: character === "rem" ? "rem" : "kanna",
  });
}
