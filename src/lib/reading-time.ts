export function estimateReadingTime(text: string): {
  minutes: number;
  words: number;
} {
  const cjk = (text.match(/[一-鿿　-〿]/g) ?? []).length;
  const enWords = (
    text
      .replace(/[一-鿿　-〿]/g, " ")
      .match(/[a-zA-Z0-9]+/g) ?? []
  ).length;

  const minutes = cjk / 300 + enWords / 220;
  return {
    minutes: Math.max(1, Math.ceil(minutes)),
    words: cjk + enWords,
  };
}

/**
 * Reading-time estimate from a precomputed word count. Used by list pages
 * that load only post metadata (no `content` column) so PostCard can still
 * render "X 字 · Y min" without re-tokenizing the full body.
 *
 * Assumes the mix matches what estimateReadingTime would produce —
 * roughly 260 words/min averaged across CJK and English at the rates above.
 */
export function readingMinutesFromWordCount(words: number): number {
  if (!Number.isFinite(words) || words <= 0) return 1;
  return Math.max(1, Math.ceil(words / 260));
}
