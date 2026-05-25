import type { ReactNode } from "react";

/**
 * Wrap occurrences of `query` (case-insensitive) inside `text` with <mark>.
 * Returns React nodes safe to embed in JSX. Empty query → original string.
 */
export function highlight(text: string, query: string): ReactNode {
  const q = query.trim();
  if (!q || !text) return text;

  const pattern = q
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  if (!pattern) return text;

  const re = new RegExp(`(${pattern})`, "gi");
  const parts = text.split(re);
  if (parts.length === 1) return text;

  return parts.map((part, i) => {
    if (i % 2 === 1) {
      return (
        <mark
          key={i}
          className="rounded bg-primary/20 px-0.5 text-primary [&]:bg-primary/20"
        >
          {part}
        </mark>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
