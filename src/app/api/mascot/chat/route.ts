import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import {
  isActiveProviderConfigured,
  streamKannaChat,
  streamRamChat,
  streamRemChat,
} from "@/lib/ai";
import type { ChatMessage } from "@/lib/ai-client";
import { siteConfig } from "@/lib/site-config";

export const runtime = "nodejs";

const PER_TURN_LIMIT = 12;
const PER_TURN_WINDOW_SEC = 10 * 60;
const DAILY_LIMIT = 60;
const DAILY_WINDOW_SEC = 24 * 60 * 60;
const MAX_HISTORY = 10;
const MAX_CONTENT_CHARS = 1000;
const MAX_TOTAL_CHARS = 4000;

const CONTROL_CHARS = new RegExp(
  "[\\u0000-\\u0008\\u000B\\u000C\\u000E-\\u001F\\u007F]",
  "g",
);

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || "unknown";
}

/**
 * Same-origin guard. Browsers send `Sec-Fetch-Site: same-origin` for
 * fetch from our own pages; cross-origin scripts get `cross-site` or
 * none. The Origin header is the fallback when Sec-Fetch headers are
 * absent (older browsers / non-CORS preflighted requests).
 */
function isSameOrigin(req: Request): boolean {
  const sfs = req.headers.get("sec-fetch-site");
  if (sfs) return sfs === "same-origin" || sfs === "same-site";
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try {
    const ours = new URL(siteConfig.url).host;
    return new URL(origin).host === ours;
  } catch {
    return false;
  }
}

function sanitizeContent(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const stripped = raw
    .replace(CONTROL_CHARS, "")
    .replace(/\s{4,}/g, "   ")
    .trim();
  if (!stripped) return null;
  if (stripped.length > MAX_CONTENT_CHARS) return null;
  return stripped;
}

export async function POST(req: Request): Promise<Response> {
  if (!isSameOrigin(req)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  if (!(await isActiveProviderConfigured())) {
    return NextResponse.json({ error: "AI 未配置" }, { status: 503 });
  }

  const ip = clientIp(req);

  // Per-turn burst limit.
  const burst = await rateLimit(ip, {
    key: "mascot-chat",
    limit: PER_TURN_LIMIT,
    windowSec: PER_TURN_WINDOW_SEC,
  });
  if (!burst.ok) {
    return NextResponse.json(
      { error: "想休息一下……稍后再聊吧" },
      { status: 429 },
    );
  }

  // Daily ceiling — defends against trickle abuse that stays under the burst cap.
  const daily = await rateLimit(ip, {
    key: "mascot-chat-daily",
    limit: DAILY_LIMIT,
    windowSec: DAILY_WINDOW_SEC,
  });
  if (!daily.ok) {
    return NextResponse.json(
      { error: "今天聊得太多啦，明天再来吧" },
      { status: 429 },
    );
  }

  let body: { messages?: unknown; character?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }

  const character =
    body.character === "rem" || body.character === "ram"
      ? body.character
      : "kanna";

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "no messages" }, { status: 400 });
  }

  const trimmed = body.messages.slice(-MAX_HISTORY);
  const messages: ChatMessage[] = [];
  let totalChars = 0;
  for (const m of trimmed) {
    if (!m || typeof m !== "object") {
      return NextResponse.json({ error: "bad message" }, { status: 400 });
    }
    const role = (m as { role?: unknown }).role;
    if (role !== "user" && role !== "assistant") {
      return NextResponse.json({ error: "bad role" }, { status: 400 });
    }
    const content = sanitizeContent((m as { content?: unknown }).content);
    if (content === null) {
      return NextResponse.json({ error: "bad content" }, { status: 400 });
    }
    totalChars += content.length;
    if (totalChars > MAX_TOTAL_CHARS) {
      return NextResponse.json({ error: "history too long" }, { status: 400 });
    }
    messages.push({ role, content });
  }

  if (messages.at(-1)?.role !== "user") {
    return NextResponse.json({ error: "last must be user" }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const streamFn =
    character === "rem"
      ? streamRemChat
      : character === "ram"
        ? streamRamChat
        : streamKannaChat;
  const errorMsg =
    character === "rem"
      ? "……(雷姆走神了，请再试一次)"
      : character === "ram"
        ? "……(拉姆暂时没有回应。再试一次。)"
        : "……(康娜走神了,再试一次)";

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const events = await streamFn({ messages });
        for await (const delta of events) {
          controller.enqueue(encoder.encode(delta));
        }
        controller.close();
      } catch (e) {
        controller.enqueue(encoder.encode(errorMsg));
        controller.close();
        // Log the error type only — never the message content/headers.
        console.error("[mascot/chat]", e instanceof Error ? e.name : "error");
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
