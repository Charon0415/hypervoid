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
      className="grid h-10 w-10 place-items-center border border-cyan-100/18 bg-white/[0.055] text-cyan-50/72 backdrop-blur-xl transition hover:border-cyan-100/45 hover:bg-cyan-50/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-100/70 touch-manipulation"
    >
      {mounted && resolvedTheme === "dark" ? <Moon className="h-4 w-4" aria-hidden /> : <Sun className="h-4 w-4" aria-hidden />}
    </button>
  );
}
