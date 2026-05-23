"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const next = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label="切换主题"
      title={`切换到${next === "dark" ? "暗色" : "亮色"}主题`}
      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-foreground transition hover:border-primary hover:text-primary"
    >
      {mounted ? (resolvedTheme === "dark" ? "☾" : "☀") : "⌛"}
    </button>
  );
}
