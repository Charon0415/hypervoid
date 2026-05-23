"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/LocaleProvider";

const HUE_KEY = "hypervoid:hue";
const DEFAULT_HUE = 240;

function applyHue(hue: number) {
  document.documentElement.style.setProperty(
    "--primary",
    `hsl(${hue} 70% 60%)`,
  );
}

export function ThemeColorPicker() {
  const [open, setOpen] = useState(false);
  const [hue, setHue] = useState<number>(DEFAULT_HUE);
  const t = useT();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HUE_KEY);
      if (stored !== null) {
        const value = Number(stored);
        if (Number.isFinite(value)) {
          setHue(value);
          applyHue(value);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const onChange = (next: number) => {
    setHue(next);
    applyHue(next);
    try {
      localStorage.setItem(HUE_KEY, String(next));
    } catch {
      // ignore
    }
  };

  const reset = () => {
    setHue(DEFAULT_HUE);
    document.documentElement.style.removeProperty("--primary");
    try {
      localStorage.removeItem(HUE_KEY);
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.common.toggleTheme}
        title="主题色 / Theme color"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card transition hover:border-primary"
      >
        <span
          className="block h-4 w-4 rounded-full"
          style={{ background: `hsl(${hue} 70% 60%)` }}
        />
      </button>
      {open ? (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 top-11 z-40 w-64 rounded-md border border-border bg-card p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">主题色</p>
              <button
                type="button"
                onClick={reset}
                className="text-xs text-muted hover:text-primary"
              >
                重置
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={360}
              step={1}
              value={hue}
              onChange={(e) => onChange(Number(e.target.value))}
              className="mt-3 w-full"
              style={{
                background:
                  "linear-gradient(to right, hsl(0 70% 60%), hsl(60 70% 60%), hsl(120 70% 60%), hsl(180 70% 60%), hsl(240 70% 60%), hsl(300 70% 60%), hsl(360 70% 60%))",
              }}
            />
            <p className="mt-2 font-mono text-xs text-muted">hue: {hue}°</p>
          </div>
        </>
      ) : null}
    </div>
  );
}
