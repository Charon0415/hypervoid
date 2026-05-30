"use client";

import { useEffect, useState, useTransition } from "react";
import {
  recordReaction,
  unrecordReaction,
} from "@/app/posts/[slug]/actions";
import {
  REACTION_EMOJIS,
  type ReactionKey,
  REACTION_KEYS,
  type ReactionCounts,
} from "@/lib/reactions-shared";

const STORAGE_PREFIX = "hypervoid:reacted:";
// One-shot migration of legacy heart likes stored as `hypervoid:liked:<slug>`.
const LEGACY_LIKED_PREFIX = "hypervoid:liked:";

function localKey(slug: string, emoji: ReactionKey): string {
  return `${STORAGE_PREFIX}${slug}:${emoji}`;
}

export function ReactionBar({
  slug,
  initialCounts,
}: {
  slug: string;
  initialCounts: ReactionCounts;
}) {
  const [counts, setCounts] = useState<ReactionCounts>(initialCounts);
  const [reacted, setReacted] = useState<Record<ReactionKey, boolean>>(
    () =>
      REACTION_KEYS.reduce(
        (acc, k) => {
          acc[k] = false;
          return acc;
        },
        {} as Record<ReactionKey, boolean>,
      ),
  );
  const [pendingKey, setPendingKey] = useState<ReactionKey | null>(null);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const next: Record<ReactionKey, boolean> = { ...reacted };
      for (const k of REACTION_KEYS) {
        next[k] = localStorage.getItem(localKey(slug, k)) === "1";
      }
      // Migrate legacy heart: if the user liked this post on the old system,
      // mark heart as reacted so they don't double-tap. Doesn't mutate the
      // DB count — that migration is server-side via setup-admin-tables.ts.
      const legacy = localStorage.getItem(`${LEGACY_LIKED_PREFIX}${slug}`);
      if (legacy === "1" && !next.heart) {
        next.heart = true;
        try {
          localStorage.setItem(localKey(slug, "heart"), "1");
          localStorage.removeItem(`${LEGACY_LIKED_PREFIX}${slug}`);
        } catch {
          /* noop */
        }
      }
      setReacted(next);
    } catch {
      /* noop */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const toggle = (emoji: ReactionKey) => {
    if (pendingKey) return;
    const wasReacted = reacted[emoji];
    setPendingKey(emoji);
    startTransition(async () => {
      const action = wasReacted ? unrecordReaction : recordReaction;
      const newCount = await action(slug, emoji);
      if (newCount !== null) {
        setCounts((c) => ({ ...c, [emoji]: newCount }));
        setReacted((r) => ({ ...r, [emoji]: !wasReacted }));
        try {
          if (!wasReacted) {
            localStorage.setItem(localKey(slug, emoji), "1");
          } else {
            localStorage.removeItem(localKey(slug, emoji));
          }
        } catch {
          /* noop */
        }
      }
      setPendingKey(null);
    });
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {REACTION_EMOJIS.map((r) => {
        const active = reacted[r.key];
        const pending = pendingKey === r.key;
        const count = counts[r.key] ?? 0;
        return (
          <button
            key={r.key}
            type="button"
            onClick={() => toggle(r.key)}
            disabled={!!pendingKey}
            aria-pressed={active}
            title={r.label}
            className={`group inline-flex items-center gap-1.5 border px-3 py-1.5 text-sm transition disabled:opacity-60 ${
              active
                ? "border-cyan-400/40 bg-cyan-400/15 text-cyan-100 shadow-[0_0_12px_rgba(103,232,249,0.15)]"
                : "border-cyan-100/18 bg-cyan-950/30 text-cyan-50/70 hover:border-cyan-400/30 hover:bg-cyan-900/30 hover:text-cyan-100"
            }`}
            style={{ clipPath: 'polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 0 100%)' }}
          >
            <span
              aria-hidden
              className={`text-base leading-none transition-transform ${
                pending
                  ? "scale-125"
                  : active
                    ? "scale-110"
                    : "group-hover:scale-110"
              }`}
            >
              {r.glyph}
            </span>
            <span className="font-mono text-xs tabular-nums">
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
