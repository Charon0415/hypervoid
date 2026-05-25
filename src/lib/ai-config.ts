import "server-only";

import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import {
  customRowToModel,
  listCustomModels,
  getCustomModel,
  type CustomModelRow,
} from "@/lib/ai-custom-models";

/**
 * Provider key — built-ins are "anthropic" / "deepseek". Custom models
 * each get their own provider key equal to their id ("custom:foo") so
 * usage tracking and quotas are isolated per endpoint.
 */
export type AiProvider = string;

export type AiModel = {
  id: string;
  provider: AiProvider;
  label: string;
  hint: string;
  upstreamId: string;
};

export const AI_MODELS: AiModel[] = [
  {
    id: "deepseek-v4-flash",
    provider: "deepseek",
    label: "DeepSeek V4 Flash",
    hint: "默认。极快、极便宜，适合摘要 / 标签 / 闲聊。",
    upstreamId: "deepseek-v4-flash",
  },
  {
    id: "deepseek-v4-pro",
    provider: "deepseek",
    label: "DeepSeek V4 Pro",
    hint: "更强的推理与文笔。适合长文与复杂分析。",
    upstreamId: "deepseek-v4-pro",
  },
  {
    id: "claude-haiku-4-5",
    provider: "anthropic",
    label: "Claude Haiku 4.5",
    hint: "Anthropic 入门款。和 DeepSeek Flash 同档。",
    upstreamId: "claude-haiku-4-5",
  },
  {
    id: "claude-sonnet-4-6",
    provider: "anthropic",
    label: "Claude Sonnet 4.6",
    hint: "推理与质量均衡。需要细腻文笔时用。",
    upstreamId: "claude-sonnet-4-6",
  },
  {
    id: "claude-opus-4-7",
    provider: "anthropic",
    label: "Claude Opus 4.7",
    hint: "顶级模型，慢且贵。适合长文复杂分析。",
    upstreamId: "claude-opus-4-7",
  },
];

export const DEFAULT_AI_MODEL_ID = "deepseek-v4-flash";

/** Stable provider keys used for built-ins. Custom models append their own. */
export const BUILTIN_PROVIDERS: { id: AiProvider; label: string }[] = [
  { id: "deepseek", label: "DeepSeek" },
  { id: "anthropic", label: "Claude (Anthropic)" },
];

/** Back-compat alias — some pages import this name. */
export const PROVIDERS = BUILTIN_PROVIDERS;

const MODEL_KEY = "ai.model";

function isBuiltinValid(id: string): boolean {
  return AI_MODELS.some((m) => m.id === id);
}

function fallbackModel(): AiModel {
  return (
    AI_MODELS.find((m) => m.id === DEFAULT_AI_MODEL_ID) ?? AI_MODELS[0]
  );
}

/**
 * Returns all models (built-in + custom). Custom rows are converted to the
 * AiModel shape; their keys/baseUrls stay in CustomModelRow accessible via
 * resolveModelRow().
 */
export async function listAllModels(): Promise<AiModel[]> {
  const custom = await listCustomModels();
  return [...AI_MODELS, ...custom.filter((c) => c.enabled).map(customRowToModel)];
}

/** Resolves to the stored selection (DB), or falls back to the default. */
export async function getActiveAiModel(): Promise<AiModel> {
  try {
    const rows = await getDb()
      .select()
      .from(schema.siteOverrides)
      .where(eq(schema.siteOverrides.key, MODEL_KEY))
      .limit(1);
    const stored = rows[0]?.value;
    if (stored) {
      if (isBuiltinValid(stored)) {
        const m = AI_MODELS.find((x) => x.id === stored);
        if (m) return m;
      }
      // Custom model lookup
      if (stored.startsWith("custom:")) {
        const row = await getCustomModel(stored);
        if (row && row.enabled) return customRowToModel(row);
      }
    }
  } catch {
    /* fall through */
  }
  return fallbackModel();
}

/**
 * Like getActiveAiModel(), but also returns the CustomModelRow if the
 * selected model is a custom one. ai-client uses this to read baseUrl,
 * apiKey, protocol, and extraHeaders.
 */
export async function resolveActiveModelWithRow(): Promise<{
  model: AiModel;
  custom: CustomModelRow | null;
}> {
  const model = await getActiveAiModel();
  if (model.id.startsWith("custom:")) {
    const custom = await getCustomModel(model.id);
    return { model, custom: custom?.enabled ? custom : null };
  }
  return { model, custom: null };
}

/**
 * Legacy compat: returns just the upstream ID. Older callers used this to
 * get a string they could pass to the Anthropic SDK; the new ai-client.ts
 * dispatches via the full AiModel record instead.
 */
export async function getAiModel(): Promise<string> {
  return (await getActiveAiModel()).upstreamId;
}

export async function setAiModel(id: string): Promise<void> {
  const valid = isBuiltinValid(id) || id.startsWith("custom:");
  if (!valid) throw new Error(`unknown model: ${id}`);
  if (id.startsWith("custom:")) {
    const row = await getCustomModel(id);
    if (!row || !row.enabled) throw new Error("自定义模型不存在或已禁用");
  }
  const now = new Date();
  await getDb()
    .insert(schema.siteOverrides)
    .values({ key: MODEL_KEY, value: id, updatedAt: now })
    .onConflictDoUpdate({
      target: schema.siteOverrides.key,
      set: { value: id, updatedAt: now },
    });
}

export function isProviderConfigured(provider: AiProvider): boolean {
  if (provider === "anthropic") return Boolean(process.env.ANTHROPIC_API_KEY);
  if (provider === "deepseek") return Boolean(process.env.DEEPSEEK_API_KEY);
  // Custom providers carry their own keys in the DB row — handled by ai-client
  // at dispatch time. We can't know from this synchronous helper alone, so
  // optimistically return true; the actual fetch will surface auth errors.
  if (provider.startsWith("custom:")) return true;
  return false;
}

/** True if the currently-selected model's provider has its key set. */
export async function isAiKeyConfigured(): Promise<boolean> {
  const { model, custom } = await resolveActiveModelWithRow();
  if (custom) return Boolean(custom.apiKey);
  return isProviderConfigured(model.provider);
}

export function maskKey(raw: string | undefined): string {
  if (!raw) return "未配置";
  if (raw.length <= 12) return "已配置（长度过短）";
  return `${raw.slice(0, 10)}…${raw.slice(-4)}`;
}

export function providerKeyHint(provider: AiProvider): string {
  if (provider === "anthropic") return maskKey(process.env.ANTHROPIC_API_KEY);
  if (provider === "deepseek") return maskKey(process.env.DEEPSEEK_API_KEY);
  return "未配置";
}
