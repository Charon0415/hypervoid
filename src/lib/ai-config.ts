import "server-only";

import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

export type AiProvider = "anthropic" | "deepseek";

export type AiModel = {
  id: string;
  provider: AiProvider;
  label: string;
  hint: string;
  /**
   * Real upstream model ID the provider's API will accept. Lets us expose
   * a stable "marketing" ID in the admin UI while the actual API string
   * can be remapped without a migration.
   */
  upstreamId: string;
};

export const AI_MODELS: AiModel[] = [
  {
    id: "deepseek-v4-flash",
    provider: "deepseek",
    label: "DeepSeek V4 Flash",
    hint: "默认。极快、极便宜，适合摘要 / 标签 / 闲聊。",
    upstreamId: "deepseek-chat",
  },
  {
    id: "deepseek-v4-pro",
    provider: "deepseek",
    label: "DeepSeek V4 Pro",
    hint: "更强的推理与文笔。适合长文与复杂分析。",
    upstreamId: "deepseek-reasoner",
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
export const PROVIDERS: { id: AiProvider; label: string }[] = [
  { id: "deepseek", label: "DeepSeek" },
  { id: "anthropic", label: "Claude (Anthropic)" },
];

const MODEL_KEY = "ai.model";

function isValid(id: string): boolean {
  return AI_MODELS.some((m) => m.id === id);
}

function fallbackModel(): AiModel {
  return (
    AI_MODELS.find((m) => m.id === DEFAULT_AI_MODEL_ID) ?? AI_MODELS[0]
  );
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
    if (stored && isValid(stored)) {
      const m = AI_MODELS.find((x) => x.id === stored);
      if (m) return m;
    }
  } catch {
    /* fall through */
  }
  return fallbackModel();
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
  if (!isValid(id)) throw new Error(`unknown model: ${id}`);
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
  return false;
}

/** True if the currently-selected model's provider has its key set. */
export async function isAiKeyConfigured(): Promise<boolean> {
  const m = await getActiveAiModel();
  return isProviderConfigured(m.provider);
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
