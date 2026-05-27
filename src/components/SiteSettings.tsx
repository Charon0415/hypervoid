"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  BACKGROUND_OPTIONS,
  DEFAULT_HUE,
  DISPLAY_MODE_OPTIONS,
  FONT_OPTIONS,
  FONT_SIZE_OPTIONS,
  HUE_PRESETS,
  THEME_PRESETS,
  useSettings,
  type BackgroundKey,
} from "@/components/SettingsProvider";
import { isMascotEnabled, setMascotEnabled } from "@/components/Live2DMascot";
import { useInstallPrompt } from "@/components/PwaInstallController";

const MASCOT_CHAR_KEY = "hypervoid:mascot-char";
const MASCOT_CHAR_EVENT = "hypervoid:mascot-character-changed";

function readMascotChar(): "kanna" | "rem" | "ram" {
  try {
    const value = localStorage.getItem(MASCOT_CHAR_KEY);
    return value === "rem" || value === "ram" ? value : "kanna";
  } catch {
    return "kanna";
  }
}

function nextMascotChar(cur: "kanna" | "rem" | "ram"): "kanna" | "rem" | "ram" {
  if (cur === "kanna") return "rem";
  if (cur === "rem") return "ram";
  return "kanna";
}

function mascotCharLabel(char: "kanna" | "rem" | "ram"): string {
  if (char === "rem") return "雷姆";
  if (char === "ram") return "拉姆";
  return "康娜";
}

function BgThumb({ bg }: { bg: BackgroundKey }) {
  const base = "h-10 w-full overflow-hidden rounded";
  switch (bg) {
    case "plain":
      return (
        <div
          className={`${base} border border-dashed border-border bg-background`}
        />
      );
    case "cosmic":
      return (
        <div
          className={`${base} relative bg-gradient-to-br from-[color-mix(in_srgb,var(--primary)_25%,transparent)] via-[color-mix(in_srgb,var(--primary)_5%,transparent)] to-background`}
        >
          <span className="absolute left-2 top-2 h-0.5 w-0.5 rounded-full bg-foreground/70" />
          <span className="absolute right-3 top-3 h-0.5 w-0.5 rounded-full bg-foreground/70" />
          <span className="absolute left-5 bottom-2 h-0.5 w-0.5 rounded-full bg-foreground/70" />
          <span className="absolute right-2 bottom-3 h-0.5 w-0.5 rounded-full bg-foreground/70" />
        </div>
      );
    case "particles":
      return (
        <div
          className={`${base} relative bg-gradient-to-br from-[color-mix(in_srgb,var(--primary)_40%,transparent)] via-[color-mix(in_srgb,var(--primary)_10%,transparent)] to-background`}
        >
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="absolute h-px w-px rounded-full bg-foreground/70"
              style={{
                left: `${((i * 23 + 7) % 90) + 5}%`,
                top: `${((i * 37 + 11) % 80) + 5}%`,
              }}
            />
          ))}
        </div>
      );
    case "paper":
      return (
        <div
          className={base}
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, var(--border) 0 1px, transparent 1px 6px), repeating-linear-gradient(90deg, var(--border) 0 1px, transparent 1px 6px)",
            backgroundColor: "var(--background)",
          }}
        />
      );
    case "waves":
      return (
        <div
          className={base}
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 50% at 30% 30%, color-mix(in srgb, var(--primary) 30%, transparent), transparent), radial-gradient(ellipse 60% 50% at 70% 70%, color-mix(in srgb, var(--primary) 20%, transparent), transparent)",
            backgroundColor: "var(--background)",
          }}
        />
      );
    case "acg":
      return (
        <div
          className={base}
          style={{
            backgroundImage: "url(/wallpapers/1.webp)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      );
    case "medieval":
      return (
        <div
          className={base}
          style={{
            backgroundImage: "url(/wallpapers/medieval.webp)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      );
    case "cyberpunk":
      return (
        <div
          className={`${base} relative`}
          style={{
            backgroundImage:
              "linear-gradient(135deg, #0a0a14 0%, #1a0a2e 50%, #050510 100%)",
          }}
        >
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 20% 30%, rgba(0,229,255,0.55), transparent 55%), radial-gradient(ellipse at 80% 75%, rgba(200,0,200,0.45), transparent 55%)",
            }}
          />
          <span
            aria-hidden
            className="absolute left-1.5 top-1.5 h-0.5 w-3 rounded-full"
            style={{ background: "#00e5ff", boxShadow: "0 0 4px #00e5ff" }}
          />
          <span
            aria-hidden
            className="absolute bottom-1.5 right-2 h-0.5 w-2 rounded-full"
            style={{ background: "#ff00d4", boxShadow: "0 0 4px #ff00d4" }}
          />
        </div>
      );
  }
}

export function SiteSettings() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mascot, setMascot] = useState(false);
  const [mascotChar, setMascotChar] = useState<"kanna" | "rem" | "ram">("kanna");
  const { available: installAvailable, install } = useInstallPrompt();
  const {
    hue,
    background,
    font,
    fontSize,
    displayMode,
    setHue,
    setBackground,
    setFont,
    setFontSize,
    setDisplayMode,
    applyPreset,
    reset,
  } = useSettings();

  useEffect(() => {
    setMounted(true);
    setMascot(isMascotEnabled());
    setMascotChar(readMascotChar());
    const mql = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    const onStorage = (e: StorageEvent) => {
      if (e.key === MASCOT_CHAR_KEY) setMascotChar(readMascotChar());
    };
    window.addEventListener("storage", onStorage);
    return () => {
      mql.removeEventListener("change", sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  // Lock body scroll while the mobile bottom-sheet is open.
  useEffect(() => {
    if (!open || !isMobile) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isMobile]);

  // Keyboard shortcuts: Cmd/Ctrl+, toggles panel; Esc closes it.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === ",") {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Reusable choice-pill classes — bigger touch targets on mobile.
  const pillBase =
    "rounded-md border px-2 py-2.5 text-sm transition md:py-1.5 md:text-xs";
  const pillIdle =
    "border-border text-muted hover:border-primary/40 hover:text-foreground";
  const pillActive = "border-primary bg-primary/10 text-primary";

  const panel = open ? (
    <>
      {/* Backdrop — dim+blur on mobile, click-catcher on desktop */}
      <div
        className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none"
        onClick={() => setOpen(false)}
        aria-hidden
      />

      {/* Panel — bottom-sheet on mobile, popover on desktop */}
      <div
        role="dialog"
        aria-label="站点设置"
        className="
          fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto
          rounded-t-2xl border-t border-x border-border bg-card shadow-2xl
          animate-[sheetUp_220ms_ease-out]
          md:absolute md:inset-x-auto md:bottom-auto md:right-0 md:top-11
          md:w-[19rem] md:max-h-[80vh] md:rounded-xl md:border md:shadow-xl
          md:animate-none
        "
        style={{
          paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))",
        }}
        onClick={(e) => e.stopPropagation()}
      >
            {/* Mobile drag-handle hint */}
            <div
              className="mx-auto mt-2 mb-1 h-1 w-9 rounded-full bg-border md:hidden"
              aria-hidden
            />

            {/* Sticky header (mobile) + flush header (desktop) */}
            <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border bg-card px-5 pb-3 pt-2 md:static md:border-0 md:px-4 md:pb-0 md:pt-4">
              <p className="text-sm font-semibold">站点设置</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={reset}
                  className="text-xs text-muted hover:text-primary"
                >
                  重置全部
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="关闭"
                  className="rounded-md p-1 text-muted hover:bg-background hover:text-foreground md:hidden"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="6" y1="6" x2="18" y2="18" />
                    <line x1="6" y1="18" x2="18" y2="6" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="px-5 pb-5 pt-2 md:px-4 md:pb-4">
              <section className="mt-3 md:mt-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-muted">
                  一键装扮
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {THEME_PRESETS.map((p) => {
                    const matches =
                      hue === p.hue &&
                      background === p.background &&
                      font === p.font &&
                      fontSize === p.fontSize;
                    return (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => applyPreset(p)}
                        title={p.hint}
                        aria-pressed={matches}
                        className={`rounded-full border px-2.5 py-1 text-xs transition ${
                          matches ? pillActive : pillIdle
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="mt-5 md:mt-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-muted">
                  主题色
                </p>
                <div className="mb-2 flex flex-wrap gap-2 md:gap-1.5">
                  {HUE_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setHue(p.hue)}
                      aria-label={p.name}
                      title={`${p.name} (${p.hue}°)`}
                      className={`h-9 w-9 rounded-full border-2 transition md:h-7 md:w-7 ${
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
                  aria-label="色相滑块"
                  className="w-full"
                  style={{
                    background:
                      "linear-gradient(to right, hsl(0 70% 60%), hsl(60 70% 60%), hsl(120 70% 60%), hsl(180 70% 60%), hsl(240 70% 60%), hsl(300 70% 60%), hsl(360 70% 60%))",
                  }}
                />
                <p className="mt-1 font-mono text-[10px] text-muted">
                  hue: {hue}°{hue !== DEFAULT_HUE ? " (自定义)" : ""}
                </p>
              </section>

              <section className="mt-5 md:mt-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-muted">
                  背景
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {BACKGROUND_OPTIONS.map((o) => {
                    const active = background === o.key;
                    return (
                      <button
                        key={o.key}
                        type="button"
                        onClick={() => setBackground(o.key)}
                        aria-pressed={active}
                        className={`group flex flex-col gap-1 rounded-lg border p-1.5 text-center transition ${
                          active
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        <BgThumb bg={o.key} />
                        <span
                          className={`text-[11px] leading-tight ${
                            active
                              ? "font-medium text-primary"
                              : "text-muted group-hover:text-foreground"
                          }`}
                        >
                          {o.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="mt-5 md:mt-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-muted">
                  显示模式
                </p>
                <div className="grid grid-cols-3 gap-2 md:gap-1.5">
                  {DISPLAY_MODE_OPTIONS.map((o) => (
                    <button
                      key={o.key}
                      type="button"
                      onClick={() => setDisplayMode(o.key)}
                      aria-pressed={displayMode === o.key}
                      title={o.hint}
                      className={`${pillBase} ${
                        displayMode === o.key ? pillActive : pillIdle
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

              <section className="mt-5 md:mt-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-muted">
                  字体
                </p>
                <div className="grid grid-cols-3 gap-2 md:gap-1.5">
                  {FONT_OPTIONS.map((o) => (
                    <button
                      key={o.key}
                      type="button"
                      onClick={() => setFont(o.key)}
                      aria-pressed={font === o.key}
                      className={`${pillBase} ${
                        font === o.key ? pillActive : pillIdle
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </section>

              <section className="mt-5 md:mt-4">
                <p className="mb-2 text-xs uppercase tracking-wider text-muted">
                  字号
                </p>
                <div className="grid grid-cols-2 gap-2 md:gap-1.5">
                  {FONT_SIZE_OPTIONS.map((o) => (
                    <button
                      key={o.key}
                      type="button"
                      onClick={() => setFontSize(o.key)}
                      aria-pressed={fontSize === o.key}
                      title={o.hint}
                      className={`${pillBase} ${
                        fontSize === o.key ? pillActive : pillIdle
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
                <p className="mt-1.5 text-[10px] text-muted">
                  {FONT_SIZE_OPTIONS.find((o) => o.key === fontSize)?.hint}
                </p>
              </section>

              {/* 看板娘 — desktop only. The mascot canvas itself also
                  bails on mobile (Live2DMascot.tsx returns null), so the
                  toggle would have no effect there; hide it to keep the
                  panel tidy on small screens. */}
              {!isMobile ? (
                <section className="mt-5 md:mt-4">
                  <p className="mb-2 text-xs uppercase tracking-wider text-muted">
                    看板娘
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !mascot;
                      setMascot(next);
                      setMascotEnabled(next);
                    }}
                    className={`${pillBase} flex items-center gap-2 ${
                      mascot ? pillActive : pillIdle
                    }`}
                    style={{ width: "100%" }}
                  >
                    <span
                      aria-hidden
                      className={`relative inline-block h-4 w-7 shrink-0 rounded-full transition-colors ${
                        mascot ? "bg-primary" : "bg-border"
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 inline-block h-3 w-3 rounded-full bg-white shadow-sm transition-all ${
                          mascot ? "left-3.5" : "left-0.5"
                        }`}
                      />
                    </span>
                    {mascot ? "已开启" : "已关闭"}
                  </button>
                  <p className="mt-1.5 text-[10px] text-muted">
                    在页面右下角显示看板娘（默认关闭）
                  </p>
                  {mascot ? (
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          const next = nextMascotChar(mascotChar);
                          localStorage.setItem(MASCOT_CHAR_KEY, next);
                          setMascotChar(next);
                          window.dispatchEvent(
                            new CustomEvent(MASCOT_CHAR_EVENT, {
                              detail: { character: next },
                            }),
                          );
                        } catch {
                          /* noop */
                        }
                      }}
                      className={`${pillBase} ${pillIdle} mt-2 flex w-full items-center justify-center gap-1.5 text-xs`}
                    >
                      当前：{mascotCharLabel(mascotChar)} · 切换为{mascotCharLabel(nextMascotChar(mascotChar))}
                    </button>
                  ) : null}
                </section>
              ) : null}

              {installAvailable ? (
                <section className="mt-5 md:mt-4">
                  <p className="mb-2 text-xs uppercase tracking-wider text-muted">
                    安装到桌面
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      install();
                    }}
                    className={`${pillBase} ${pillIdle} flex w-full items-center justify-center gap-2`}
                  >
                    <span aria-hidden>📲</span>
                    立即安装 Hypervoid
                  </button>
                  <p className="mt-1.5 text-[10px] text-muted">
                    把站点装到桌面 / 主屏，启动更快，离线也能看缓存过的页面。
                  </p>
                </section>
              ) : null}

              <p className="mt-4 hidden text-[10px] text-muted md:block">
                快捷键：⌘/Ctrl + , 打开 · Esc 关闭
              </p>
            </div>
          </div>
        </>
      ) : null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="站点设置"
        aria-expanded={open}
        title="主题 · 背景 · 字体 (⌘/Ctrl+,)"
        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-card/70 backdrop-blur-sm transition hover:border-primary hover:bg-card"
      >
        <span
          className="block h-4 w-4 rounded-full ring-2 ring-background"
          style={{ background: `hsl(${hue} 70% 60%)` }}
        />
      </button>
      {mounted && isMobile && panel
        ? createPortal(panel, document.body)
        : panel}
    </div>
  );
}
