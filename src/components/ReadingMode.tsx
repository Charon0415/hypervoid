"use client";

import { useEffect, useState } from "react";

type Mode = "normal" | "sepia" | "large";

const KEY = "hypervoid:reading-mode";

function apply(mode: Mode) {
  document.documentElement.dataset.reading = mode;
}

export function ReadingMode() {
  const [mode, setMode] = useState<Mode>("normal");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY) as Mode | null;
      if (saved === "sepia" || saved === "large") {
        setMode(saved);
        apply(saved);
      } else {
        apply("normal");
      }
    } catch {
      // ignore
    }
    return () => {
      document.documentElement.removeAttribute("data-reading");
    };
  }, []);

  function pick(next: Mode) {
    setMode(next);
    apply(next);
    setOpen(false);
    try {
      if (next === "normal") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, next);
    } catch {
      // ignore
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="阅读模式"
        title="阅读模式"
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted transition hover:border-primary/40 hover:text-primary"
      >
        <svg
          aria-hidden
          className="h-3.5 w-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      </button>
      {open ? (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-10 z-40 flex w-40 flex-col gap-0.5 rounded-lg border border-border bg-card p-1 shadow-lg">
            {(
              [
                ["normal", "默认"],
                ["sepia", "护眼 (Sepia)"],
                ["large", "护眼 · 大号"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => pick(key)}
                className={`rounded-md px-3 py-1.5 text-left text-xs transition ${
                  mode === key
                    ? "bg-primary/10 text-primary"
                    : "text-muted hover:bg-primary/5 hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
