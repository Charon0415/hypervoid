"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePlayer } from "@/components/PlayerProvider";

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

export function HomePlayerWidget() {
  const {
    current,
    playing,
    currentTime,
    duration,
    loading,
    tracksLoaded,
    error,
    ensureTracksLoaded,
    togglePlay,
    next,
    prev,
  } = usePlayer();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [saying, setSaying] = useState("");

  const refreshSaying = useCallback(() => {
    if (typeof window === "undefined") return;
    const day = Math.floor(Date.now() / 86_400_000);
    setSaying(SAYINGS[day % SAYINGS.length]);
  }, []);

  useEffect(() => {
    setOpen(loadOpen());
    setMounted(true);
    refreshSaying();
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

  // Don't show the widget at all on first render to avoid flashing the
  // open state from the default (closed) → persisted (open) on hydration.
  if (!mounted) return null;

  return (
    <aside className="rounded-3xl border border-border bg-card p-5">
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
            className="group inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-0.5 text-[11px] text-muted transition hover:border-primary/40 hover:text-primary"
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
            className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-border bg-background text-muted transition hover:border-primary/40 hover:text-primary"
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

      {!open ? (
        <p
          onClick={toggleOpen}
          className="mt-3 cursor-pointer text-center text-xs text-muted/70 leading-relaxed transition-colors hover:text-muted"
          style={{ fontFamily: "Georgia, 'Noto Serif SC', serif" }}
        >
          {saying || "音乐是灵魂的避难所。"}
        </p>
      ) : null}

      {open ? (
        <div className="mt-3">
          {loading && !tracksLoaded ? (
            <p className="rounded-2xl border border-dashed border-border px-3 py-4 text-center text-xs text-muted">
              加载歌单中…
            </p>
          ) : error && !tracksLoaded ? (
            <p className="rounded-2xl border border-dashed border-border px-3 py-4 text-center text-xs text-muted">
              {error}
            </p>
          ) : !current ? (
            <div className="rounded-2xl border border-dashed border-border px-3 py-4 text-center">
              <p className="text-xs text-muted mb-2">
                暂无可播放曲目。
              </p>
              <p className="text-[11px] text-muted/60 leading-relaxed"
                style={{ fontFamily: "Georgia, 'Noto Serif SC', serif" }}
              >
                {saying}
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                {current.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={current.cover}
                    alt={current.title}
                    className={`h-12 w-12 shrink-0 rounded-lg object-cover shadow-sm ${
                      playing ? "animate-[spin_20s_linear_infinite]" : ""
                    }`}
                    style={{ animationPlayState: playing ? "running" : "paused" }}
                  />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 text-xl">
                    ♪
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p
                    className="truncate text-sm font-medium tracking-tight"
                    title={current.title}
                  >
                    {current.title}
                  </p>
                  <p
                    className="truncate text-xs text-muted"
                    title={current.artist}
                  >
                    {current.artist}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className="w-8 text-right font-mono text-[10px] text-muted">
                  {formatTime(currentTime)}
                </span>
                <div className="relative h-1 flex-1 rounded-full bg-border">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-primary transition-[width] duration-100"
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

              <div className="mt-3 flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={prev}
                  aria-label="上一首"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition hover:bg-background hover:text-foreground"
                >
                  <svg
                    className="h-3.5 w-3.5"
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
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-40"
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
                      className="h-4 w-4"
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
                  className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition hover:bg-background hover:text-foreground"
                >
                  <svg
                    className="h-3.5 w-3.5"
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
    </aside>
  );
}
