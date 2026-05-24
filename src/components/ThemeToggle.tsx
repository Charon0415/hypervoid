"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useT } from "@/components/LocaleProvider";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useT();

  useEffect(() => setMounted(true), []);

  const next = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={t.common.toggleTheme}
      title={t.common.toggleTheme}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card/70 text-foreground backdrop-blur-sm transition hover:border-primary hover:bg-card hover:text-primary touch-manipulation"
    >
      {mounted ? (resolvedTheme === "dark" ? "☾" : "☀") : "⌛"}
    </button>
  );
}
