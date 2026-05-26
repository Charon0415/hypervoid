"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStateCtx, useTimeCtx, useActions, type Track } from "@/components/PlayerProvider";

type LyricLine = { t: number; text: string };

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function MusicPlayer({ initialTracks }: { initialTracks: Track[] }) {
  const {
    tracks,
    currentIdx,
    volume,
    muted,
    repeatMode,
    shuffle,
    tracksLoaded,
    loading,
    error,
  } = useStateCtx();
  const {
    current,
    playing,
    currentTime,
    duration,
    seek,
    togglePlay,
    next,
    prev,
  } = useTimeCtx();
  const {
    setTracks,
    ensureTracksLoaded,
    playAt,
    setVolume,
    toggleMute,
    cycleRepeat,
    toggleShuffle,
  } = useActions();

  const progressRef = useRef<HTMLDivElement>(null);

  const [listOpen, setListOpen] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [lyrics, setLyrics] = useState<LyricLine[] | null>(null);
  const [lyricsLoading, setLyricsLoading] = useState(false);
  const [lyricsForId, setLyricsForId] = useState<number | null>(null);

  // Seed the global player on first mount from SSR-provided tracks
  useEffect(() => {
    if (initialTracks.length > 0 && !tracksLoaded) {
      setTracks(initialTracks);
    } else if (initialTracks.length === 0 && !tracksLoaded) {
      void ensureTracksLoaded();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch lyrics when the current song changes (if lyrics panel was ever opened
  // we keep it open and refresh; otherwise wait until user opens it).
  useEffect(() => {
    if (!current || !lyricsOpen) return;
    if (lyricsForId === current.id) return;
    setLyricsLoading(true);
    setLyrics(null);
    fetch(`/api/music/lyrics?id=${current.id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data) => {
        setLyrics(Array.isArray(data.lines) ? data.lines : []);
        setLyricsForId(current.id);
      })
      .catch(() => {
        setLyrics([]);
        setLyricsForId(current.id);
      })
      .finally(() => setLyricsLoading(false));
  }, [current, lyricsOpen, lyricsForId]);

  const activeLyricIdx = useMemo(() => {
    if (!lyrics || lyrics.length === 0) return -1;
    let lo = 0;
    let hi = lyrics.length - 1;
    let best = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (lyrics[mid].t <= currentTime) {
        best = mid;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    return best;
  }, [lyrics, currentTime]);

  // Auto-scroll active lyric line into view
  const lyricsBoxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (activeLyricIdx < 0) return;
    const box = lyricsBoxRef.current;
    if (!box) return;
    const line = box.querySelector<HTMLElement>(
      `[data-lyric-idx="${activeLyricIdx}"]`,
    );
    if (line) {
      line.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeLyricIdx]);

  const seekTo = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = progressRef.current;
      if (!bar || duration <= 0) return;
      const rect = bar.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      seek(pct * duration);
    },
    [duration, seek],
  );

  if (!tracksLoaded && loading) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted">
        加载歌单中……
      </div>
    );
  }

  if (!tracksLoaded && error) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm text-muted">
        {error}
      </div>
    );
  }

  if (tracks.length === 0) {
    return null;
  }

  const progressPct =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="relative">
        {/* Blurred backdrop derived from cover, gives the YesPlayMusic look. */}
        {current?.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.cover}
            alt=""
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover opacity-30 blur-3xl saturate-150"
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-card/40 via-card/60 to-card" />

        <div className="relative flex flex-col gap-6 p-6 sm:flex-row sm:gap-7 sm:p-8">
          {/* Cover */}
          <div className="mx-auto flex-shrink-0 sm:mx-0">
            {current?.cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={current.cover}
                alt={current.title}
                className={`h-48 w-48 rounded-2xl object-cover shadow-2xl ring-1 ring-black/5 sm:h-56 sm:w-56 ${
                  playing ? "animate-[spin_30s_linear_infinite]" : ""
                }`}
                style={{ animationPlayState: playing ? "running" : "paused" }}
              />
            ) : (
              <div className="flex h-48 w-48 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-6xl shadow-2xl sm:h-56 sm:w-56">
                ♪
              </div>
            )}
          </div>

          {/* Track info + controls */}
          <div className="flex min-w-0 flex-1 flex-col">
            <p className="text-xs font-mono uppercase tracking-widest text-muted">
              {currentIdx + 1} / {tracks.length}
            </p>
            <h2 className="mt-1 truncate text-xl font-bold tracking-tight sm:text-2xl">
              {current?.title ?? "未选择歌曲"}
            </h2>
            <p className="mt-1 truncate text-sm text-muted">
              {current?.artist}
            </p>

            {/* Progress */}
            <div className="mt-5 flex items-center gap-3">
              <span className="w-10 text-right font-mono text-[11px] text-muted">
                {formatTime(currentTime)}
              </span>
              <div
                ref={progressRef}
                onClick={seekTo}
                className="group/progress relative h-1.5 flex-1 cursor-pointer rounded-full bg-border/60"
              >
                <div
                  className="absolute left-0 top-0 h-full rounded-full bg-primary transition-[width] duration-200"
                  style={{ width: `${progressPct}%` }}
                />
                <div
                  className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary opacity-0 shadow transition group-hover/progress:opacity-100"
                  style={{ left: `${progressPct}%` }}
                />
              </div>
              <span className="w-10 font-mono text-[11px] text-muted">
                {formatTime(duration)}
              </span>
            </div>

            {/* Primary controls */}
            <div className="mt-5 flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleShuffle}
                aria-label={shuffle ? "关闭随机播放" : "开启随机播放"}
                aria-pressed={shuffle}
                title={shuffle ? "随机播放：开" : "随机播放：关"}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                  shuffle
                    ? "bg-primary/15 text-primary"
                    : "text-muted hover:bg-background hover:text-foreground"
                }`}
              >
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <polyline points="16 3 21 3 21 8" />
                  <line x1="4" y1="20" x2="21" y2="3" />
                  <polyline points="21 16 21 21 16 21" />
                  <line x1="15" y1="15" x2="21" y2="21" />
                  <line x1="4" y1="4" x2="9" y2="9" />
                </svg>
              </button>

              <button
                type="button"
                onClick={prev}
                aria-label="上一首"
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-background hover:text-foreground"
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
                className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition hover:opacity-90 disabled:opacity-40"
              >
                {playing ? (
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden
                  >
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
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
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-background hover:text-foreground"
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

              <button
                type="button"
                onClick={cycleRepeat}
                aria-label={`循环模式：${repeatMode === "off" ? "关" : repeatMode === "all" ? "列表循环" : "单曲循环"}`}
                title={`循环模式：${repeatMode === "off" ? "关" : repeatMode === "all" ? "列表循环" : "单曲循环"}`}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                  repeatMode !== "off"
                    ? "bg-primary/15 text-primary"
                    : "text-muted hover:bg-background hover:text-foreground"
                }`}
              >
                {repeatMode === "one" ? (
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <polyline points="17 1 21 5 17 9" />
                    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                    <polyline points="7 23 3 19 7 15" />
                    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                    <text x="9" y="16" fontSize="8" fill="currentColor" stroke="none">1</text>
                  </svg>
                ) : (
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                  >
                    <polyline points="17 1 21 5 17 9" />
                    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                    <polyline points="7 23 3 19 7 15" />
                    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                  </svg>
                )}
              </button>

              {/* Volume */}
              <div className="ml-auto flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleMute}
                  aria-label={muted ? "取消静音" : "静音"}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-background hover:text-foreground"
                >
                  {muted || volume === 0 ? (
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <line x1="23" y1="9" x2="17" y2="15" />
                      <line x1="17" y1="9" x2="23" y2="15" />
                    </svg>
                  ) : (
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                    </svg>
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={muted ? 0 : volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  aria-label="音量"
                  className="h-1 w-20 cursor-pointer accent-primary"
                />
              </div>
            </div>

            {/* Panel toggles */}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setLyricsOpen((v) => !v)}
                aria-expanded={lyricsOpen}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
                  lyricsOpen
                    ? "border-primary/40 bg-primary/5 text-primary"
                    : "border-border bg-background text-muted hover:border-primary/40 hover:text-primary"
                }`}
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <line x1="4" y1="6" x2="20" y2="6" />
                  <line x1="4" y1="12" x2="14" y2="12" />
                  <line x1="4" y1="18" x2="18" y2="18" />
                </svg>
                歌词
              </button>
              <button
                type="button"
                onClick={() => setListOpen((v) => !v)}
                aria-expanded={listOpen}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition ${
                  listOpen
                    ? "border-primary/40 bg-primary/5 text-primary"
                    : "border-border bg-background text-muted hover:border-primary/40 hover:text-primary"
                }`}
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                列表 · {tracks.length}
              </button>
            </div>
          </div>
        </div>
      </div>

      {lyricsOpen ? (
        <div className="border-t border-border bg-background/30">
          {lyricsLoading ? (
            <p className="px-6 py-6 text-center text-xs text-muted">
              加载歌词中…
            </p>
          ) : lyrics && lyrics.length > 0 ? (
            <div
              ref={lyricsBoxRef}
              className="max-h-72 overflow-y-auto px-6 py-6 text-center scroll-smooth"
            >
              <ul className="flex flex-col gap-2">
                {lyrics.map((line, i) => (
                  <li
                    key={i}
                    data-lyric-idx={i}
                    className={`text-sm leading-relaxed transition ${
                      i === activeLyricIdx
                        ? "font-medium text-primary"
                        : "text-muted/70"
                    }`}
                  >
                    {line.text}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="px-6 py-6 text-center text-xs text-muted">
              暂无歌词
            </p>
          )}
        </div>
      ) : null}

      {listOpen ? (
        <div className="max-h-80 overflow-y-auto border-t border-border bg-background/30">
          <ul className="divide-y divide-border/60">
            {tracks.map((t, i) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => playAt(i)}
                  className={`flex w-full items-center gap-3 px-5 py-2.5 text-left text-sm transition hover:bg-primary/5 ${
                    i === currentIdx ? "bg-primary/5 text-primary" : ""
                  }`}
                >
                  <span className="w-6 shrink-0 text-right font-mono text-[10px] text-muted">
                    {i === currentIdx && playing ? (
                      <span aria-hidden className="inline-block animate-pulse">
                        ▶
                      </span>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{t.title}</span>
                  <span className="hidden shrink-0 truncate text-xs text-muted sm:inline">
                    {t.artist}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-muted">
                    {formatTime(t.duration)}
                  </span>
                  {!t.url ? (
                    <span
                      className="shrink-0 font-mono text-[10px] text-muted/60"
                      title="此歌曲无可播放音频（VIP / 下架）"
                    >
                      无源
                    </span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
