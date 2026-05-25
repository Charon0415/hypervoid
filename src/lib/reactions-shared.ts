/** Client-safe constants shared between ReactionBar and reactions.ts (server). */

export const REACTION_EMOJIS = [
  { key: "heart", glyph: "❤️", label: "喜欢" },
  { key: "fire", glyph: "🔥", label: "顶" },
  { key: "thinking", glyph: "🤔", label: "在想" },
  { key: "eyes", glyph: "👀", label: "看见了" },
  { key: "party", glyph: "🎉", label: "庆祝" },
] as const;

export type ReactionKey = (typeof REACTION_EMOJIS)[number]["key"];

export const REACTION_KEYS: readonly ReactionKey[] = REACTION_EMOJIS.map(
  (e) => e.key,
);

export type ReactionCounts = Record<ReactionKey, number>;

export function emptyReactionCounts(): ReactionCounts {
  return REACTION_KEYS.reduce((acc, key) => {
    acc[key] = 0;
    return acc;
  }, {} as ReactionCounts);
}
