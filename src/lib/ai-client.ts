import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import { getActiveAiModel, type AiModel } from "@/lib/ai-config";

/**
 * Provider-agnostic chat layer used by every AI feature in the project.
 * Each call resolves the active model from /admin/ai, then dispatches to
 * Anthropic SDK or DeepSeek's OpenAI-compatible HTTP API.
 */

export type ChatMessage = { role: "user" | "assistant"; content: string };

let _anthropic: Anthropic | null = null;
function anthropicClient(): Anthropic {
  if (_anthropic) return _anthropic;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY 未配置");
  _anthropic = new Anthropic({ apiKey });
  return _anthropic;
}

function deepseekKey(): string {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key) throw new Error("DEEPSEEK_API_KEY 未配置");
  return key;
}

/** Non-streaming completion — returns the assistant's full text. */
export async function chat(args: {
  system: string;
  messages: ChatMessage[];
  maxTokens: number;
  /** Override the active model — defaults to the admin-selected one. */
  model?: AiModel;
}): Promise<string> {
  const model = args.model ?? (await getActiveAiModel());
  if (model.provider === "anthropic") {
    const client = anthropicClient();
    const res = await client.messages.create({
      model: model.upstreamId,
      max_tokens: args.maxTokens,
      system: args.system,
      messages: args.messages,
    });
    for (const block of res.content) {
      if (block.type === "text") return block.text.trim();
    }
    throw new Error("Anthropic 没有返回文本");
  }

  // DeepSeek (OpenAI-compatible)
  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${deepseekKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model.upstreamId,
      max_tokens: args.maxTokens,
      messages: [
        { role: "system", content: args.system },
        ...args.messages,
      ],
      stream: false,
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`DeepSeek ${res.status}: ${errText.slice(0, 200)}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new Error("DeepSeek 没有返回文本");
  return text.trim();
}

/**
 * Streaming completion — yields incremental text chunks. Used by AskAI and
 * the Kanna mascot chat. Output is plain delta text (no SSE envelope).
 */
export async function* chatStream(args: {
  system: string;
  messages: ChatMessage[];
  maxTokens: number;
  /** If set, marks the system block as ephemerally cacheable (Anthropic only). */
  cacheSystem?: boolean;
  model?: AiModel;
}): AsyncGenerator<string, void, unknown> {
  const model = args.model ?? (await getActiveAiModel());

  if (model.provider === "anthropic") {
    const client = anthropicClient();
    const stream = client.messages.stream({
      model: model.upstreamId,
      max_tokens: args.maxTokens,
      system: args.cacheSystem
        ? [
            {
              type: "text",
              text: args.system,
              cache_control: { type: "ephemeral" },
            },
          ]
        : args.system,
      messages: args.messages,
    });
    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        yield event.delta.text;
      }
    }
    return;
  }

  // DeepSeek — SSE stream over `data: ...` lines
  const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${deepseekKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model.upstreamId,
      max_tokens: args.maxTokens,
      messages: [
        { role: "system", content: args.system },
        ...args.messages,
      ],
      stream: true,
    }),
  });
  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => "");
    throw new Error(`DeepSeek ${res.status}: ${errText.slice(0, 200)}`);
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: false });
  let buf = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n");
    buf = lines.pop() ?? "";
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith("data:")) continue;
      const payload = trimmed.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const obj = JSON.parse(payload) as {
          choices?: { delta?: { content?: string } }[];
        };
        const text = obj.choices?.[0]?.delta?.content;
        if (text) yield text;
      } catch {
        /* ignore malformed chunk */
      }
    }
  }
}
