"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useStateCtx, useTimeCtx, useActions } from "@/components/PlayerProvider";

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function FloatingPlayer() {
  const {
    tracks,
    currentIdx,
    volume,
    muted,
    shuffle,
    repeatMode,
    tracksLoaded,
  } = useStateCtx();
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
  const {
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    playAt,
  } = useActions();

  const [expanded, setExpanded] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [playlistUp, setPlaylistUp] = useState(false);
  const [visible, setVisible] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef(false);

  useEffect(() => {
    if (tracksLoaded && current) {
      const t = setTimeout(() => setVisible(true), 500);
      return () => clearTimeout(t);
    }
    setVisible(false);
  }, [tracksLoaded, current]);

  useEffect(() => {
    if (!expanded) return;
    const onDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setExpanded(false);
        setShowPlaylist(false);
      }
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [expanded]);

  const handleTogglePlaylist = useCallback(() => {
    setShowPlaylist((v) => {
      if (!v && panelRef.current) {
        const rect = panelRef.current.getBoundingClientRect();
        setPlaylistUp(rect.top < 300);
      }
      return !v;
    });
  }, []);

  if (!tracksLoaded || !current || !visible) return null;

  const progressPct = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div
      ref={panelRef}
      className="fixed bottom-20 left-4 z-30 select-none sm:bottom-6 sm:left-6 animate-[float-in_0.3s_ease-out]"
    >
      {expanded ? (
        <div className="flex flex-col gap-2 rounded-2xl bg-white/70 p-3 shadow-xl backdrop-blur-xl dark:bg-slate-900/80 border border-white/30 dark:border-white/10 min-w-[280px] sm:min-w-[320px]">
          {/* Header */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden shadow-md shrink-0 border border-white/30"
              style={{ animation: playing ? "spin 8s linear infinite" : "none" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- NCM cover hosts vary; this tiny animated artwork should not go through image optimization. */}
              <img
                src={current.cover}
                alt={current.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold truncate text-slate-900 dark:text-white">
                {current.title}
              </p>
              <p className="text-[10px] sm:text-xs truncate text-slate-600 dark:text-slate-400">
                {current.artist}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 shrink-0"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 15 12 9 18 15" />
              </svg>
            </button>
          </div>

          {/* Progress */}
          <div
            className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400"
            onClick={(e) => {
              e.stopPropagation();
              const rect = (e.target as HTMLElement).getBoundingClientRect();
              const pct = (e.clientX - rect.left) / rect.width;
              seek(pct * duration);
            }}
          >
            <span className="w-8 text-right">{formatTime(currentTime)}</span>
            <div className="flex-1 h-1 rounded-full bg-slate-200/60 dark:bg-slate-700/50 cursor-pointer relative">
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-primary transition-[width] duration-100"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="w-8">{formatTime(duration)}</span>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={toggleShuffle}
              className={`p-1 rounded-full transition ${shuffle ? "text-primary" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
              title={shuffle ? "随机播放：开" : "随机播放：关"}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" />
                <line x1="15" y1="15" x2="21" y2="21" />
                <line x1="4" y1="4" x2="9" y2="9" />
              </svg>
            </button>

            <div className="flex items-center gap-1">
              <button type="button" onClick={prev} className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full transition">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6V6zm3.5 6 8.5 6V6l-8.5 6z" /></svg>
              </button>
              <button
                type="button"
                onClick={togglePlay}
                disabled={!current.url}
                className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:opacity-90 disabled:opacity-40 transition"
              >
                {playing ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                ) : (
                  <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7L8 5z" /></svg>
                )}
              </button>
              <button type="button" onClick={next} className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-full transition">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M16 18h2V6h-2v12zM6 18l8.5-6L6 6v12z" /></svg>
              </button>
            </div>

            <button
              type="button"
              onClick={cycleRepeat}
              className={`p-1 rounded-full transition ${repeatMode !== "off" ? "text-primary" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
              title={`循环：${repeatMode === "off" ? "关" : repeatMode === "all" ? "列表" : "单曲"}`}
            >
              {repeatMode === "one" ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="17 1 21 5 17 9" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <polyline points="7 23 3 19 7 15" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                  <text x="9" y="16" fontSize="8" fill="currentColor" stroke="none">1</text>
                </svg>
              ) : (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="17 1 21 5 17 9" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <polyline points="7 23 3 19 7 15" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
              )}
            </button>
          </div>

          {/* Volume + playlist toggle */}
          <div className="flex items-center gap-2">
            <button type="button" onClick={toggleMute} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-full transition shrink-0">
              {muted || volume === 0 ? (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
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
              className="h-1 flex-1 accent-primary cursor-pointer"
            />
            <button
              type="button"
              onClick={handleTogglePlaylist}
              className={`p-1 rounded-full transition shrink-0 ${showPlaylist ? "text-primary" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"}`}
              title="播放列表"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </button>
          </div>

          {/* Playlist */}
          {showPlaylist ? (
            <div
              className={`absolute left-0 right-0 z-40 mx-2 max-h-56 overflow-y-auto rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-xl ${
                playlistUp ? "bottom-full mb-2" : "top-full mt-2"
              }`}
            >
              {tracks.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => { playAt(i); }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition hover:bg-primary/5 ${
                    i === currentIdx ? "bg-primary/5 text-primary font-medium" : "text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <span className="w-5 text-right font-mono text-[10px] text-slate-400">
                    {i === currentIdx && playing ? "▶" : i + 1}
                  </span>
                  <span className="flex-1 truncate">{t.title}</span>
                  <span className="hidden sm:inline text-[10px] text-slate-400 truncate max-w-[80px]">
                    {t.artist}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : (
        /* Collapsed pill */
        <button
          type="button"
          onClick={() => { if (!dragRef.current) setExpanded(true); }}
          className="flex items-center gap-2 rounded-full bg-white/70 backdrop-blur-xl border border-white/30 dark:border-white/10 shadow-lg px-2 py-1.5 dark:bg-slate-900/80 hover:shadow-xl transition-shadow"
        >
          <div
            className="w-9 h-9 rounded-full overflow-hidden shadow-sm border border-white/30 shrink-0"
            style={{ animation: playing ? "spin 6s linear infinite" : "none" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- NCM cover hosts vary; this tiny animated artwork should not go through image optimization. */}
            <img src={current.cover} alt="" className="w-full h-full object-cover" />
          </div>
          <div className="hidden sm:block min-w-0 pr-1">
            <p className="text-xs font-semibold truncate text-slate-900 dark:text-white max-w-[120px]">
              {current.title}
            </p>
            <p className="text-[10px] truncate text-slate-500 dark:text-slate-400 max-w-[120px]">
              {current.artist}
            </p>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            disabled={!current.url}
            className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow hover:opacity-90 disabled:opacity-40 transition shrink-0"
          >
            {playing ? (
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
            ) : (
              <svg className="w-3.5 h-3.5 ml-0.5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7L8 5z" /></svg>
            )}
          </button>
        </button>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes float-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
