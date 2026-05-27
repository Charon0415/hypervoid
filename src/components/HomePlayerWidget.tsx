"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useStateCtx, useTimeCtx, useActions } from "@/components/PlayerProvider";

const OPEN_KEY = "hypervoid:home-player:open";

const SAYINGS = [
  "音乐是灵魂的避难所。",
  "每一个音符都是星辰。",
  "闭上眼睛，世界就安静了。",
  "在旋律中遇见另一个自己。",
  "耳机是通往另一个世界的入口。",
  "听见风的声音，也听见自己。",
  "无需言语，只需聆听。",
  "音乐是时间的艺术。",
];

function loadOpen(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(OPEN_KEY) === "true";
  } catch {
    return false;
  }
}

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

/** Seed a deterministic pseudo-random height array from a number. */
function waveformBars(seed: number, count: number): number[] {
  const bars: number[] = [];
  let s = seed || 1;
  for (let i = 0; i < count; i++) {
    s = (s * 16807 + 12345) % 2147483647;
    bars.push(0.3 + (s % 71) / 100);
  }
  return bars;
}

const BAR_COUNT = 32;

export function HomePlayerWidget() {
  const { loading, tracksLoaded, error } = useStateCtx();
  const {
    current,
    playing,
    currentTime,
    duration,
    togglePlay,
    next,
    prev,
    seek,
  } = useTimeCtx();
  const { ensureTracksLoaded } = useActions();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [saying, setSaying] = useState("");
  const [fxEnabled, setFxEnabled] = useState(false);

  const refreshSaying = useCallback(() => {
    if (typeof window === "undefined") return;
    const day = Math.floor(Date.now() / 86_400_000);
    setSaying(SAYINGS[day % SAYINGS.length]);
  }, []);

  useEffect(() => {
    setOpen(loadOpen());
    setMounted(true);
    refreshSaying();
    fetch("/api/effects")
      .then((r) => r.json())
      .then((d) => setFxEnabled(Boolean(d.playerWidget)))
      .catch(() => {});
  }, [refreshSaying]);

  const toggleOpen = () => {
    setOpen((prevOpen) => {
      const nextOpen = !prevOpen;
      try {
        localStorage.setItem(OPEN_KEY, String(nextOpen));
      } catch {
        /* noop */
      }
      if (nextOpen) {
        void ensureTracksLoaded();
      }
      return nextOpen;
    });
  };

  const bars = useMemo(
    () => waveformBars(current?.id ?? 0, BAR_COUNT),
    [current?.id],
  );

  const progressPct =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seek(pct * duration);
  };

  if (!mounted) return null;

  return (
    <aside
      className={
        fxEnabled
          ? "relative overflow-hidden rounded-3xl border border-border/50 bg-card"
          : "rounded-3xl border border-border bg-card p-5"
      }
    >
      {/* Ambient blurred cover backdrop — only when effects enabled */}
      {fxEnabled && open && current?.cover ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.cover}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full scale-150 object-cover opacity-25 blur-2xl saturate-150 transition-opacity duration-700"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-card/40 via-card/70 to-card" />
        </>
      ) : null}

      {/* Content */}
      <div className={fxEnabled ? "relative z-10 p-5" : undefined}>
        {/* Header */}
        <div className="flex items-baseline justify-between">
          <h3 className="text-sm font-semibold tracking-tight text-foreground/80">
            <span className="mr-1.5" aria-hidden>
              ♪
            </span>
            音乐播放器
          </h3>
          <div className="flex items-center gap-1.5">
            <Link
              href="/music"
              className="group inline-flex items-center gap-1 rounded-full border border-border bg-background/60 px-2.5 py-0.5 text-[11px] text-muted transition hover:border-primary/40 hover:text-primary backdrop-blur-sm"
            >
              完整版
              <svg
                aria-hidden
                className="h-3 w-3 transition group-hover:translate-x-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
            <button
              type="button"
              onClick={toggleOpen}
              aria-expanded={open}
              aria-label={open ? "收起播放器" : "展开播放器"}
              className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background/60 text-muted transition hover:border-primary/40 hover:text-primary backdrop-blur-sm"
            >
              <svg
                aria-hidden
                className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        </div>

        {/* Collapsed: daily saying */}
        {!open ? (
          <p
            onClick={toggleOpen}
            className="mt-3 cursor-pointer text-center text-xs text-muted/70 leading-relaxed transition-colors hover:text-muted"
            style={{ fontFamily: "Georgia, 'Noto Serif SC', serif" }}
          >
            {saying || "音乐是灵魂的避难所。"}
          </p>
        ) : null}

        {/* Expanded: player */}
        {open ? (
          <div className="mt-3">
            {loading && !tracksLoaded ? (
              <p className="rounded-2xl border border-dashed border-border/60 bg-card/60 px-3 py-4 text-center text-xs text-muted backdrop-blur-sm">
                加载歌单中…
              </p>
            ) : error && !tracksLoaded ? (
              <p className="rounded-2xl border border-dashed border-border/60 bg-card/60 px-3 py-4 text-center text-xs text-muted backdrop-blur-sm">
                {error}
              </p>
            ) : !current ? (
              <div className="rounded-2xl border border-dashed border-border/60 bg-card/60 px-3 py-4 text-center backdrop-blur-sm">
                <p className="text-xs text-muted mb-2">
                  暂无可播放曲目。
                </p>
                <p
                  className="text-[11px] text-muted/60 leading-relaxed"
                  style={{ fontFamily: "Georgia, 'Noto Serif SC', serif" }}
                >
                  {saying}
                </p>
              </div>
            ) : (
              <>
                {/* Album art + info */}
                <div className="flex items-center gap-3">
                  {current.cover ? (
                    <div className="relative shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={current.cover}
                        alt={current.title}
                        className={`object-cover shadow-sm ${
                          fxEnabled
                            ? `h-14 w-14 rounded-full shadow-lg ring-1 ring-black/5 dark:ring-white/10 ${
                                playing ? "animate-[spin_20s_linear_infinite]" : ""
                              }`
                            : `h-12 w-12 rounded-full ${
                                playing ? "animate-[spin_20s_linear_infinite]" : ""
                              }`
                        }`}
                        style={{
                          animationPlayState: playing ? "running" : "paused",
                        }}
                      />
                      {/* Glow effect — only when effects enabled */}
                      {fxEnabled && playing ? (
                        <div className="absolute -inset-1 -z-10 rounded-full bg-primary/15 blur-md" />
                      ) : null}
                    </div>
                  ) : (
                    <div
                      className={`flex shrink-0 items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5 ${
                        fxEnabled
                          ? "h-14 w-14 rounded-full text-2xl shadow-lg ring-1 ring-black/5 dark:ring-white/10"
                          : "h-12 w-12 rounded-full text-xl"
                      }`}
                    >
                      ♪
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p
                      className="truncate text-sm font-semibold tracking-tight"
                      title={current.title}
                    >
                      {current.title}
                    </p>
                    <p
                      className="mt-0.5 truncate text-xs text-muted"
                      title={current.artist}
                    >
                      {current.artist}
                    </p>
                  </div>
                </div>

                {/* Progress bar — waveform when effects on, simple when off */}
                {fxEnabled ? (
                  <div className="mt-3">
                    <div
                      className="flex h-8 cursor-pointer items-end gap-[2px]"
                      onClick={handleBarClick}
                      role="slider"
                      aria-label="播放进度"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(progressPct)}
                    >
                      {bars.map((h, i) => {
                        const barPct = ((i + 0.5) / BAR_COUNT) * 100;
                        const filled = barPct <= progressPct;
                        return (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-colors duration-150 ${
                              filled ? "bg-primary" : "bg-border/60"
                            }`}
                            style={{ height: `${h * 100}%` }}
                          />
                        );
                      })}
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="font-mono text-[10px] text-muted/70">
                        {formatTime(currentTime)}
                      </span>
                      <span className="font-mono text-[10px] text-muted/70">
                        {formatTime(duration)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="w-8 text-right font-mono text-[10px] text-muted">
                      {formatTime(currentTime)}
                    </span>
                    <div className="relative h-1 flex-1 rounded-full bg-border">
                      <div
                        className="absolute left-0 top-0 h-full rounded-full bg-primary transition-[width] duration-200"
                        style={{
                          width:
                            duration > 0
                              ? `${Math.min(100, (currentTime / duration) * 100)}%`
                              : "0%",
                        }}
                      />
                    </div>
                    <span className="w-8 font-mono text-[10px] text-muted">
                      {formatTime(duration)}
                    </span>
                  </div>
                )}

                {/* Controls */}
                <div className="mt-3 flex items-center justify-center gap-1">
                  <button
                    type="button"
                    onClick={prev}
                    aria-label="上一首"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-foreground/5 hover:text-foreground"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M6 6h2v12H6V6zm3.5 6 8.5 6V6l-8.5 6z" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={togglePlay}
                    disabled={!current?.url}
                    aria-label={playing ? "暂停" : "播放"}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background shadow-md transition hover:opacity-90 disabled:opacity-40"
                  >
                    {playing ? (
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden
                      >
                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                      </svg>
                    ) : (
                      <svg
                        className="h-4 w-4 ml-0.5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden
                      >
                        <path d="M8 5v14l11-7L8 5z" />
                      </svg>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={next}
                    aria-label="下一首"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-foreground/5 hover:text-foreground"
                  >
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M16 18h2V6h-2v12zM6 18l8.5-6L6 6v12z" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </aside>
  );
}
