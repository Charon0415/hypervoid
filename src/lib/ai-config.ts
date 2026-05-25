import "server-only";

import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";

/**
 * Available Claude models surfaced in the admin AI console.
 * The Anthropic SDK accepts these IDs directly.
 */
export const AI_MODELS = [
  {
    id: "claude-haiku-4-5",
    label: "Haiku 4.5",
    hint: "速度快、便宜——默认。适合摘要、标签、闲聊。",
  },
  {
    id: "claude-sonnet-4-6",
    label: "Sonnet 4.6",
    hint: "推理与质量均衡。需要更细腻文笔时选它。",
  },
  {
    id: "claude-opus-4-7",
    label: "Opus 4.7",
    hint: "顶级模型，慢且贵。适合长文复杂分析。",
  },
] as const;

export type AiModelId = (typeof AI_MODELS)[number]["id"];

export const DEFAULT_AI_MODEL: AiModelId = "claude-haiku-4-5";

const MODEL_KEY = "ai.model";

function isValid(id: string): id is AiModelId {
  return AI_MODELS.some((m) => m.id === id);
}

export async function getAiModel(): Promise<AiModelId> {
  try {
    const rows = await getDb()
      .select()
      .from(schema.siteOverrides)
      .where(eq(schema.siteOverrides.key, MODEL_KEY))
      .limit(1);
    const stored = rows[0]?.value;
    if (stored && isValid(stored)) return stored;
  } catch {
    /* fall through */
  }
  return DEFAULT_AI_MODEL;
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

export function isAiKeyConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/** Mask an API key for display in admin UI: first 8 chars + last 4. */
export function maskedKeyHint(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return "未配置";
  if (key.length <= 12) return "已配置（长度过短）";
  return `${key.slice(0, 10)}…${key.slice(-4)}`;
}
