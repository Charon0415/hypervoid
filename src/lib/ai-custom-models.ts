import "server-only";

import { asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import type { AiModel, AiProvider } from "@/lib/ai-config";

/**
 * Admin-defined custom AI models. Each row maps a stable id (used as the
 * radio button value in /admin/ai) to a runtime endpoint + key. Supports
 * two upstream protocols:
 *   - "openai":    POST {baseUrl}/chat/completions   (OpenRouter, SiliconFlow,
 *                  Groq, Ollama, LM Studio, vLLM, any OpenAI-compatible)
 *   - "anthropic": POST {baseUrl}/v1/messages         (Anthropic-compatible
 *                  proxies / self-hosted gateways)
 *
 * The id is namespaced "custom:" so it can never collide with a built-in
 * model id; AiProvider on the public type widens to string so downstream
 * code can branch on "custom:..." for usage tracking.
 */

export type CustomModelRow = {
  id: string;
  label: string;
  hint: string | null;
  protocol: "openai" | "anthropic";
  baseUrl: string;
  upstreamId: string;
  apiKey: string;
  extraHeaders: Record<string, string>;
  enabled: boolean;
};

export type CustomModelInput = {
  id: string;
  label: string;
  hint?: string;
  protocol: "openai" | "anthropic";
  baseUrl: string;
  upstreamId: string;
  apiKey: string;
  extraHeaders?: Record<string, string>;
  enabled?: boolean;
};

export function customIdNamespace(rawId: string): string {
  return rawId.startsWith("custom:") ? rawId : `custom:${rawId}`;
}

function stripPrefix(id: string): string {
  return id.startsWith("custom:") ? id.slice("custom:".length) : id;
}

export async function listCustomModels(): Promise<CustomModelRow[]> {
  try {
    const rows = await getDb()
      .select()
      .from(schema.aiCustomModels)
      .orderBy(asc(schema.aiCustomModels.label));
    return rows.map((r) => ({
      id: r.id,
      label: r.label,
      hint: r.hint,
      protocol: (r.protocol === "anthropic" ? "anthropic" : "openai") as
        | "openai"
        | "anthropic",
      baseUrl: r.baseUrl,
      upstreamId: r.upstreamId,
      apiKey: r.apiKey,
      extraHeaders: (r.extraHeaders || {}) as Record<string, string>,
      enabled: r.enabled,
    }));
  } catch {
    return [];
  }
}

export async function getCustomModel(
  id: string,
): Promise<CustomModelRow | null> {
  try {
    const rows = await getDb()
      .select()
      .from(schema.aiCustomModels)
      .where(eq(schema.aiCustomModels.id, id))
      .limit(1);
    const r = rows[0];
    if (!r) return null;
    return {
      id: r.id,
      label: r.label,
      hint: r.hint,
      protocol: (r.protocol === "anthropic" ? "anthropic" : "openai") as
        | "openai"
        | "anthropic",
      baseUrl: r.baseUrl,
      upstreamId: r.upstreamId,
      apiKey: r.apiKey,
      extraHeaders: (r.extraHeaders || {}) as Record<string, string>,
      enabled: r.enabled,
    };
  } catch {
    return null;
  }
}

export async function upsertCustomModel(input: CustomModelInput): Promise<void> {
  const id = customIdNamespace(input.id.trim());
  if (!/^custom:[a-z0-9][a-z0-9-]{1,40}$/i.test(id))
    throw new Error("id 必须是 2-40 位字母数字/连字符");
  if (!input.label.trim()) throw new Error("label 不能为空");
  if (!input.baseUrl.trim()) throw new Error("baseUrl 不能为空");
  if (!input.upstreamId.trim()) throw new Error("upstreamId 不能为空");
  if (!input.apiKey.trim()) throw new Error("apiKey 不能为空");
  if (input.protocol !== "openai" && input.protocol !== "anthropic")
    throw new Error("protocol 必须是 openai 或 anthropic");

  const now = new Date();
  const row = {
    id,
    label: input.label.trim(),
    hint: input.hint?.trim() || null,
    protocol: input.protocol,
    baseUrl: input.baseUrl.trim().replace(/\/+$/, ""),
    upstreamId: input.upstreamId.trim(),
    apiKey: input.apiKey.trim(),
    extraHeaders: input.extraHeaders || {},
    enabled: input.enabled ?? true,
    updatedAt: now,
  };

  await getDb()
    .insert(schema.aiCustomModels)
    .values({ ...row, createdAt: now })
    .onConflictDoUpdate({
      target: schema.aiCustomModels.id,
      set: row,
    });
}

export async function deleteCustomModel(id: string): Promise<void> {
  await getDb().delete(schema.aiCustomModels).where(eq(schema.aiCustomModels.id, id));
}

/** Map a CustomModelRow into the same shape AI_MODELS uses (without the key). */
export function customRowToModel(row: CustomModelRow): AiModel {
  return {
    id: row.id,
    provider: row.id as AiProvider, // custom models track usage per row
    label: row.label,
    hint: row.hint || (row.protocol === "anthropic" ? "自定义 Anthropic 兼容" : "自定义 OpenAI 兼容"),
    upstreamId: row.upstreamId,
  };
}

/**
 * For UI display only: strips the namespace so the form field shows what
 * the admin originally typed.
 */
export function customDisplayId(id: string): string {
  return stripPrefix(id);
}

export function maskCustomKey(raw: string): string {
  if (!raw) return "未填";
  if (raw.length <= 8) return "已填(过短)";
  return `${raw.slice(0, 4)}…${raw.slice(-4)}`;
}
