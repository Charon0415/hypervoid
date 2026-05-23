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
