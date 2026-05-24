"use client";

import { useState } from "react";
import {
  BACKGROUND_OPTIONS,
  DEFAULT_HUE,
  DISPLAY_MODE_OPTIONS,
  FONT_OPTIONS,
  HUE_PRESETS,
  useSettings,
} from "@/components/SettingsProvider";

export function SiteSettings() {
  const [open, setOpen] = useState(false);
  const {
    hue,
    background,
    font,
    displayMode,
    setHue,
    setBackground,
    setFont,
    setDisplayMode,
    reset,
  } = useSettings();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="站点设置"
        title="主题 · 背景 · 字体"
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
          <div className="absolute right-0 top-11 z-40 w-72 max-w-[calc(100vw-1rem)] rounded-xl border border-border bg-card p-4 shadow-xl">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">站点设置</p>
              <button
                type="button"
                onClick={reset}
                className="text-xs text-muted hover:text-primary"
              >
                重置全部
              </button>
            </div>

            <section className="mt-4">
              <p className="mb-2 text-xs uppercase tracking-wider text-muted">
                主题色
              </p>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {HUE_PRESETS.map((p) => (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => setHue(p.hue)}
                    aria-label={p.name}
                    title={`${p.name} (${p.hue}°)`}
                    className={`h-7 w-7 rounded-full border-2 transition ${
                      hue === p.hue
                        ? "border-foreground"
                        : "border-transparent hover:border-border"
                    }`}
                    style={{ background: `hsl(${p.hue} 70% 60%)` }}
                  />
                ))}
              </div>
              <input
                type="range"
                min={0}
                max={360}
                step={1}
                value={hue}
                onChange={(e) => setHue(Number(e.target.value))}
                className="w-full"
                style={{
                  background:
                    "linear-gradient(to right, hsl(0 70% 60%), hsl(60 70% 60%), hsl(120 70% 60%), hsl(180 70% 60%), hsl(240 70% 60%), hsl(300 70% 60%), hsl(360 70% 60%))",
                }}
              />
              <p className="mt-1 font-mono text-[10px] text-muted">
                hue: {hue}°
                {hue !== DEFAULT_HUE ? " (自定义)" : ""}
              </p>
            </section>

            <section className="mt-4">
              <p className="mb-2 text-xs uppercase tracking-wider text-muted">
                背景
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {BACKGROUND_OPTIONS.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => setBackground(o.key)}
                    aria-pressed={background === o.key}
                    className={`rounded-md border px-2 py-1.5 text-xs transition ${
                      background === o.key
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-4">
              <p className="mb-2 text-xs uppercase tracking-wider text-muted">
                显示模式
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {DISPLAY_MODE_OPTIONS.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => setDisplayMode(o.key)}
                    aria-pressed={displayMode === o.key}
                    title={o.hint}
                    className={`rounded-md border px-2 py-1.5 text-xs transition ${
                      displayMode === o.key
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
              <p className="mt-1.5 text-[10px] text-muted">
                {DISPLAY_MODE_OPTIONS.find((o) => o.key === displayMode)?.hint}
              </p>
            </section>

            <section className="mt-4">
              <p className="mb-2 text-xs uppercase tracking-wider text-muted">
                字体
              </p>
              <div className="grid grid-cols-3 gap-1.5">
                {FONT_OPTIONS.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => setFont(o.key)}
                    aria-pressed={font === o.key}
                    className={`rounded-md border px-2 py-1.5 text-xs transition ${
                      font === o.key
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted hover:border-primary/40 hover:text-foreground"
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </section>
          </div>
        </>
      ) : null}
    </div>
  );
}
