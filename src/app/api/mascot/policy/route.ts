import { NextResponse } from "next/server";
import { getSiteOverride } from "@/lib/site-config-server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isOn(value: string): boolean {
  return value !== "off";
}

export async function GET() {
  const [allowUserSwitch, showSwitchButton] = await Promise.all([
    getSiteOverride("mascot.allowUserSwitch"),
    getSiteOverride("mascot.showSwitchButton"),
  ]);

  return NextResponse.json({
    allowUserSwitch: isOn(allowUserSwitch),
    showSwitchButton: isOn(showSwitchButton),
  });
}
