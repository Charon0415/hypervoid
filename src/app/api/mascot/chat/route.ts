import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";
import { isActiveProviderConfigured, streamKannaChat } from "@/lib/ai";
import type { ChatMessage } from "@/lib/ai-client";

export const runtime = "nodejs";

function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  return fwd?.split(",")[0]?.trim() || "unknown";
}

export async function POST(req: Request): Promise<Response> {
  if (!(await isActiveProviderConfigured())) {
    return NextResponse.json({ error: "AI 未配置" }, { status: 503 });
  }

  const rl = rateLimit(clientIp(req), {
    key: "mascot-chat",
    limit: 30,
    windowSec: 10 * 60,
  });
  if (!rl.ok) {
    return NextResponse.json(
      { error: "康娜想休息一下…稍后再聊" },
      { status: 429 },
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid body" }, { status: 400 });
  }
  const messages = (body.messages ?? []).slice(-12);
  if (messages.length === 0) {
    return NextResponse.json({ error: "no messages" }, { status: 400 });
  }
  for (const m of messages) {
    if (m.role !== "user" && m.role !== "assistant") {
      return NextResponse.json({ error: "bad role" }, { status: 400 });
    }
    if (typeof m.content !== "string" || m.content.length > 4000) {
      return NextResponse.json({ error: "bad content" }, { status: 400 });
    }
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const events = await streamKannaChat({ messages });
        for await (const delta of events) {
          controller.enqueue(encoder.encode(delta));
        }
        controller.close();
      } catch (e) {
        controller.enqueue(
          encoder.encode("……(康娜走神了,再试一次)"),
        );
        controller.close();
        console.error("[mascot/chat]", e);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Accel-Buffering": "no",
    },
  });
}
