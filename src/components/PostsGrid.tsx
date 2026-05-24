"use client";

import { useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "posts-two-col";

export function PostsGrid({ children }: { children: ReactNode }) {
  const [twoCol, setTwoCol] = useState(true);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) setTwoCol(saved === "1");
    } catch {
      // ignore (private mode, etc.)
    }
  }, []);

  function setLayout(v: boolean) {
    setTwoCol(v);
    try {
      localStorage.setItem(STORAGE_KEY, v ? "1" : "0");
    } catch {
      // ignore
    }
  }

  return (
    <>
      <div className="flex items-center justify-end gap-1">
        <div className="inline-flex items-center gap-0.5 rounded-full border border-border bg-card p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setLayout(false)}
            aria-label="单列"
            aria-pressed={!twoCol}
            className={`grid h-7 w-7 place-items-center rounded-full transition ${
              !twoCol
                ? "bg-primary text-primary-foreground"
                : "text-muted hover:bg-primary/10 hover:text-foreground"
            }`}
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
              <rect x="4" y="5" width="16" height="3.5" rx="1" />
              <rect x="4" y="10.5" width="16" height="3.5" rx="1" />
              <rect x="4" y="16" width="16" height="3.5" rx="1" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setLayout(true)}
            aria-label="双列"
            aria-pressed={twoCol}
            className={`grid h-7 w-7 place-items-center rounded-full transition ${
              twoCol
                ? "bg-primary text-primary-foreground"
                : "text-muted hover:bg-primary/10 hover:text-foreground"
            }`}
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
              <rect x="4" y="5" width="7" height="14" rx="1" />
              <rect x="13" y="5" width="7" height="14" rx="1" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`grid gap-4 ${twoCol ? "sm:grid-cols-2" : "grid-cols-1"}`}
      >
        {children}
      </div>
    </>
  );
}
