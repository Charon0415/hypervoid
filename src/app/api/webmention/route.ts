import { NextResponse } from "next/server";
import {
  markRejected,
  markVerified,
  targetSlugFromUrl,
  upsertPending,
  verifySource,
} from "@/lib/webmentions";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function rateKey(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: Request): Promise<NextResponse> {
  const rl = await rateLimit(rateKey(req), {
    key: "webmention",
    limit: 12,
    windowSec: 60 * 60,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many webmentions, slow down." },
      { status: 429 },
    );
  }

  let source: string | null = null;
  let target: string | null = null;
  const contentType = req.headers.get("content-type") ?? "";
  try {
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      const params = new URLSearchParams(text);
      source = params.get("source");
      target = params.get("target");
    } else if (contentType.includes("application/json")) {
      const body = await req.json();
      source = body?.source ?? null;
      target = body?.target ?? null;
    } else {
      const params = new URL(req.url).searchParams;
      source = params.get("source");
      target = params.get("target");
    }
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  if (!source || !target) {
    return NextResponse.json(
      { error: "source and target are required" },
      { status: 400 },
    );
  }
  if (source === target) {
    return NextResponse.json(
      { error: "source and target must differ" },
      { status: 400 },
    );
  }
  const targetSlug = targetSlugFromUrl(target);
  if (!targetSlug) {
    return NextResponse.json(
      { error: "target is not a recognised post URL on this site" },
      { status: 400 },
    );
  }

  let id: string;
  try {
    id = await upsertPending({ source, target, targetSlug });
  } catch (e) {
    console.error("[webmention] db error:", e);
    return NextResponse.json({ error: "database error" }, { status: 500 });
  }

  // Verify synchronously (5s cap). Spec allows async w/ 202, but since most
  // webmention senders treat any 2xx as "accepted", we just run inline.
  const verification = await verifySource(source, target);
  if (!verification.ok) {
    await markRejected(id);
    return NextResponse.json(
      { status: "rejected", reason: verification.reason },
      { status: 400 },
    );
  }
  await markVerified(id, {
    type: "mention",
    content: verification.content,
    authorName: verification.authorName,
    authorUrl: verification.authorUrl,
    authorPhoto: verification.authorPhoto,
  });
  return NextResponse.json({ status: "verified", id }, { status: 201 });
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    info: "Send a POST with source and target (form-encoded or JSON) to register a webmention.",
  });
}
