import "server-only";

import Anthropic from "@anthropic-ai/sdk";
import {
  resolveActiveModelWithRow,
  type AiModel,
} from "@/lib/ai-config";
import { getCustomModel } from "@/lib/ai-custom-models";
import {
  ensureUnderQuota,
  estimateTokens,
  recordUsage,
} from "@/lib/ai-quota";

/**
 * Provider-agnostic chat layer used by every AI feature in the project.
 * Each call:
 *   1. Resolves the active model (built-in OR admin-defined custom row).
 *   2. Enforces today's per-provider token quota — throws QuotaExceededError
 *      if already over.
 *   3. Dispatches to Anthropic SDK, DeepSeek (OpenAI-compatible), or a
 *      custom OpenAI-/Anthropic-compatible endpoint.
 *   4. Records prompt+completion token counts back into `ai_usage`.
 */

export type ChatMessage = { role: "user" | "assistant"; content: string };

type EndpointConfig = {
  protocol: "openai" | "anthropic";
  baseUrl: string;
  apiKey: string;
  extraHeaders: Record<string, string>;
  providerKey: string;
};

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

/**
 * Resolves the upstream endpoint config for a given model. Built-in models
 * use their dedicated SDK / hardcoded host. Custom models return their
 * baseUrl/key/protocol from the DB row.
 */
async function resolveEndpoint(model: AiModel): Promise<EndpointConfig | null> {
  if (model.provider === "anthropic") return null; // SDK path
  if (model.provider === "deepseek") {
    return {
      protocol: "openai",
      baseUrl: "https://api.deepseek.com/v1",
      apiKey: deepseekKey(),
      extraHeaders: {},
      providerKey: "deepseek",
    };
  }
  if (model.id.startsWith("custom:")) {
    const row = await getCustomModel(model.id);
    if (!row) throw new Error(`custom model not found: ${model.id}`);
    return {
      protocol: row.protocol,
      baseUrl: row.baseUrl,
      apiKey: row.apiKey,
      extraHeaders: row.extraHeaders,
      providerKey: row.id,
    };
  }
  throw new Error(`unknown provider: ${model.provider}`);
}

/** Non-streaming completion — returns the assistant's full text. */
export async function chat(args: {
  system: string;
  messages: ChatMessage[];
  maxTokens: number;
  model?: AiModel;
}): Promise<string> {
  const resolved = args.model
    ? { model: args.model, custom: null }
    : await resolveActiveModelWithRow();
  const model = resolved.model;
  const providerKey = model.provider === "anthropic"
    ? "anthropic"
    : model.id.startsWith("custom:")
    ? model.id
    : model.provider;

  await ensureUnderQuota(providerKey);

  if (model.provider === "anthropic") {
    const client = anthropicClient();
    const res = await client.messages.create({
      model: model.upstreamId,
      max_tokens: args.maxTokens,
      system: args.system,
      messages: args.messages,
    });
    let text = "";
    for (const block of res.content) {
      if (block.type === "text") text = block.text.trim();
    }
    await recordUsage("anthropic", {
      prompt: res.usage?.input_tokens ?? 0,
      completion: res.usage?.output_tokens ?? 0,
    });
    if (!text) throw new Error("Anthropic 没有返回文本");
    return text;
  }

  const endpoint = await resolveEndpoint(model);
  if (!endpoint) throw new Error(`endpoint not resolved for ${model.id}`);

  if (endpoint.protocol === "anthropic") {
    return chatAnthropicCompat({
      endpoint,
      system: args.system,
      messages: args.messages,
      maxTokens: args.maxTokens,
      upstreamId: model.upstreamId,
    });
  }

  // OpenAI-compatible JSON path
  const res = await fetch(`${endpoint.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${endpoint.apiKey}`,
      "Content-Type": "application/json",
      ...endpoint.extraHeaders,
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
    throw new Error(
      `${endpoint.providerKey} ${res.status}: ${errText.slice(0, 200)}`,
    );
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
  };
  const text = data.choices?.[0]?.message?.content;
  await recordUsage(endpoint.providerKey, {
    prompt:
      data.usage?.prompt_tokens ??
      estimateTokens(args.system + args.messages.map((m) => m.content).join("\n")),
    completion: data.usage?.completion_tokens ?? estimateTokens(text || ""),
  });
  if (!text) throw new Error(`${endpoint.providerKey} 没有返回文本`);
  return text.trim();
}

async function chatAnthropicCompat(args: {
  endpoint: EndpointConfig;
  system: string;
  messages: ChatMessage[];
  maxTokens: number;
  upstreamId: string;
}): Promise<string> {
  const res = await fetch(`${args.endpoint.baseUrl}/v1/messages`, {
    method: "POST",
    headers: {
      "x-api-key": args.endpoint.apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
      ...args.endpoint.extraHeaders,
    },
    body: JSON.stringify({
      model: args.upstreamId,
      max_tokens: args.maxTokens,
      system: args.system,
      messages: args.messages,
    }),
  });
  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(
      `${args.endpoint.providerKey} ${res.status}: ${errText.slice(0, 200)}`,
    );
  }
  const data = (await res.json()) as {
    content?: { type?: string; text?: string }[];
    usage?: { input_tokens?: number; output_tokens?: number };
  };
  let text = "";
  for (const block of data.content || []) {
    if (block.type === "text" && typeof block.text === "string") {
      text = block.text.trim();
    }
  }
  await recordUsage(args.endpoint.providerKey, {
    prompt:
      data.usage?.input_tokens ??
      estimateTokens(args.system + args.messages.map((m) => m.content).join("\n")),
    completion: data.usage?.output_tokens ?? estimateTokens(text),
  });
  if (!text) throw new Error(`${args.endpoint.providerKey} 没有返回文本`);
  return text;
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
  const resolved = args.model
    ? { model: args.model, custom: null }
    : await resolveActiveModelWithRow();
  const model = resolved.model;
  const providerKey = model.provider === "anthropic"
    ? "anthropic"
    : model.id.startsWith("custom:")
    ? model.id
    : model.provider;

  await ensureUnderQuota(providerKey);

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
    let inputTokens = 0;
    let outputTokens = 0;
    let collected = "";
    for await (const event of stream) {
      if (event.type === "message_start") {
        inputTokens =
          (event.message.usage as { input_tokens?: number } | undefined)
            ?.input_tokens ?? 0;
      } else if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        collected += event.delta.text;
        yield event.delta.text;
      } else if (event.type === "message_delta") {
        outputTokens =
          (event.usage as { output_tokens?: number } | undefined)
            ?.output_tokens ?? outputTokens;
      }
    }
    await recordUsage("anthropic", {
      prompt: inputTokens,
      completion: outputTokens || estimateTokens(collected),
    });
    return;
  }

  const endpoint = await resolveEndpoint(model);
  if (!endpoint) throw new Error(`endpoint not resolved for ${model.id}`);

  if (endpoint.protocol === "anthropic") {
    yield* streamAnthropicCompat({
      endpoint,
      system: args.system,
      messages: args.messages,
      maxTokens: args.maxTokens,
      upstreamId: model.upstreamId,
    });
    return;
  }

  // OpenAI-compatible SSE path
  const res = await fetch(`${endpoint.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${endpoint.apiKey}`,
      "Content-Type": "application/json",
      ...endpoint.extraHeaders,
    },
    body: JSON.stringify({
      model: model.upstreamId,
      max_tokens: args.maxTokens,
      messages: [
        { role: "system", content: args.system },
        ...args.messages,
      ],
      stream: true,
      stream_options: { include_usage: true },
    }),
  });
  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => "");
    throw new Error(
      `${endpoint.providerKey} ${res.status}: ${errText.slice(0, 200)}`,
    );
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: false });
  let buf = "";
  let prompt = 0;
  let completion = 0;
  let collected = "";
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
      if (payload === "[DONE]") {
        await recordUsage(endpoint.providerKey, {
          prompt:
            prompt ||
            estimateTokens(
              args.system + args.messages.map((m) => m.content).join("\n"),
            ),
          completion: completion || estimateTokens(collected),
        });
        return;
      }
      try {
        const obj = JSON.parse(payload) as {
          choices?: { delta?: { content?: string } }[];
          usage?: {
            prompt_tokens?: number;
            completion_tokens?: number;
          };
        };
        const text = obj.choices?.[0]?.delta?.content;
        if (text) {
          collected += text;
          yield text;
        }
        if (obj.usage) {
          prompt = obj.usage.prompt_tokens ?? prompt;
          completion = obj.usage.completion_tokens ?? completion;
        }
      } catch {
        /* ignore malformed chunk */
      }
    }
  }
  // Stream ended without [DONE] — record what we have.
  await recordUsage(endpoint.providerKey, {
    prompt:
      prompt ||
      estimateTokens(
        args.system + args.messages.map((m) => m.content).join("\n"),
      ),
    completion: completion || estimateTokens(collected),
  });
}

async function* streamAnthropicCompat(args: {
  endpoint: EndpointConfig;
  system: string;
  messages: ChatMessage[];
  maxTokens: number;
  upstreamId: string;
}): AsyncGenerator<string, void, unknown> {
  const res = await fetch(`${args.endpoint.baseUrl}/v1/messages`, {
    method: "POST",
    headers: {
      "x-api-key": args.endpoint.apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
      ...args.endpoint.extraHeaders,
    },
    body: JSON.stringify({
      model: args.upstreamId,
      max_tokens: args.maxTokens,
      system: args.system,
      messages: args.messages,
      stream: true,
    }),
  });
  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => "");
    throw new Error(
      `${args.endpoint.providerKey} ${res.status}: ${errText.slice(0, 200)}`,
    );
  }
  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8", { fatal: false });
  let buf = "";
  let inputTokens = 0;
  let outputTokens = 0;
  let collected = "";
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
      if (payload === "[DONE]") continue;
      try {
        const obj = JSON.parse(payload) as {
          type?: string;
          message?: { usage?: { input_tokens?: number } };
          delta?: { type?: string; text?: string };
          usage?: { output_tokens?: number };
        };
        if (obj.type === "message_start") {
          inputTokens = obj.message?.usage?.input_tokens ?? 0;
        } else if (
          obj.type === "content_block_delta" &&
          obj.delta?.type === "text_delta" &&
          typeof obj.delta.text === "string"
        ) {
          collected += obj.delta.text;
          yield obj.delta.text;
        } else if (obj.type === "message_delta") {
          outputTokens = obj.usage?.output_tokens ?? outputTokens;
        }
      } catch {
        /* ignore */
      }
    }
  }
  await recordUsage(args.endpoint.providerKey, {
    prompt: inputTokens,
    completion: outputTokens || estimateTokens(collected),
  });
}
