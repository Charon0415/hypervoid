/**
 * POST /api/friends/apply — submit a friend link application.
 * Spam protection: honeypot field + rate limiting.
 */
import { rateLimit } from "@/lib/rate-limit";
import { createFriend } from "@/db/friends";

export const dynamic = "force-dynamic";

function getIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: Request) {
  const rl = await rateLimit(getIp(request), {
    key: "friend-apply",
    limit: 2,
    windowSec: 3600,
  });
  if (!rl.ok) {
    return Response.json(
      { error: "申请过于频繁，请稍后再试" },
      { status: 429 },
    );
  }

  let body: Record<string, string>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Honeypot
  if (body._website) {
    return Response.json({ ok: true });
  }

  const name = (body.name ?? "").trim();
  const url = (body.url ?? "").trim();
  const description = (body.description ?? "").trim();
  const email = (body.email ?? "").trim();

  if (!name || name.length > 30) {
    return Response.json({ error: "名称 1-30 字" }, { status: 400 });
  }
  if (!url || !/^https?:\/\/.+/.test(url)) {
    return Response.json({ error: "请输入有效的网址" }, { status: 400 });
  }
  if (description && description.length > 120) {
    return Response.json({ error: "简介最多 120 字" }, { status: 400 });
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "邮箱格式不对" }, { status: 400 });
  }

  try {
    await createFriend({ name, url, description: description || null, email: email || null }, "pending");
    return Response.json({ ok: true, message: "申请已提交，审核通过后会出现在友链列表。" });
  } catch (e) {
    return Response.json(
      { error: "提交失败，请稍后重试" },
      { status: 500 },
    );
  }
}
