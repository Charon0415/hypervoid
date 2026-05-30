"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
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
      className="grid h-10 w-10 place-items-center border border-border bg-card text-muted backdrop-blur-xl transition hover:border-border hover:bg-card-hover hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-accent touch-manipulation"
    >
      {mounted && resolvedTheme === "dark" ? <Moon className="h-4 w-4" aria-hidden /> : <Sun className="h-4 w-4" aria-hidden />}
    </button>
  );
}
