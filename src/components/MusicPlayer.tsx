"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type Track = {
  id: number;
  title: string;
  artist: string;
  cover: string;
  duration: number;
  url: string | null;
};

function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export function MusicPlayer({ initialTracks }: { initialTracks: Track[] }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  const [tracks, setTracks] = useState<Track[]>(initialTracks);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [listOpen, setListOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const current = tracks[currentIdx] ?? null;

  // Load playlist from API if no initial tracks
  useEffect(() => {
    if (initialTracks.length > 0) return;
    setLoading(true);
    fetch("/api/music/playlist")
      .then((r) => r.json())
      .then((data) => {
        if (data.tracks?.length > 0) {
          setTracks(data.tracks);
        }
      })
      .catch(() => {
        /* noop */
      })
      .finally(() => setLoading(false));
  }, [initialTracks.length]);

  // Sync audio element with state
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current?.url) return;
    audio.src = current.url;
    if (playing) {
      audio.play().catch(() => setPlaying(false));
    }
  }, [current?.id, current?.url]); // eslint-disable-line react-hooks/exhaustive-deps

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !current?.url) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play().catch(() => setPlaying(false));
      setPlaying(true);
    }
  }, [playing, current?.url]);

  const playNext = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentIdx((i) => (i + 1) % tracks.length);
    setPlaying(true);
  }, [tracks.length]);

  const playPrev = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentIdx((i) => (i - 1 + tracks.length) % tracks.length);
    setPlaying(true);
  }, [tracks.length]);

  const playTrack = useCallback(
    (idx: number) => {
      setCurrentIdx(idx);
      setPlaying(true);
    },
    [],
  );

  const onTimeUpdate = useCallback(() => {
    const audio = audioRef.current;
    if (audio) setCurrentTime(audio.currentTime * 1000);
  }, []);

  const onLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (audio) setDuration(audio.duration * 1000);
  }, []);

  const onEnded = useCallback(() => {
    playNext();
  }, [playNext]);

  const seekTo = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const bar = progressRef.current;
      const audio = audioRef.current;
      if (!bar || !audio || !duration) return;
      const rect = bar.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      audio.currentTime = (pct * duration) / 1000;
      setCurrentTime(pct * duration);
    },
    [duration],
  );

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted">
        加载歌单中……
      </div>
    );
  }

  if (tracks.length === 0) {
    return null;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card">
      <audio
        ref={audioRef}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
        preload="metadata"
      />

      {/* Player bar */}
      <div className="flex items-center gap-4 p-4 sm:p-5">
        {/* Cover */}
        {current?.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.cover}
            alt={current.title}
            className={`h-16 w-16 shrink-0 rounded-lg object-cover shadow-sm ${playing ? "animate-[spin_20s_linear_infinite]" : ""}`}
            style={{ animationPlayState: playing ? "running" : "paused" }}
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 text-2xl">
            ♪
          </div>
        )}

        {/* Track info */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {current?.title ?? "未选择歌曲"}
          </p>
          <p className="truncate text-xs text-muted">{current?.artist}</p>

          {/* Progress bar */}
          <div className="mt-2 flex items-center gap-2">
            <span className="w-8 text-right font-mono text-[10px] text-muted">
              {formatTime(currentTime)}
            </span>
            <div
              ref={progressRef}
              onClick={seekTo}
              className="relative h-1.5 flex-1 cursor-pointer rounded-full bg-border"
            >
              <div
                className="absolute left-0 top-0 h-full rounded-full bg-primary transition-[width] duration-100"
                style={{
                  width: duration > 0 ? `${(currentTime / duration) * 100}%` : "0%",
                }}
              />
            </div>
            <span className="w-8 font-mono text-[10px] text-muted">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={playPrev}
            aria-label="上一首"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-background hover:text-foreground"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M6 6h2v12H6V6zm3.5 6 8.5 6V6l-8.5 6z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={togglePlay}
            disabled={!current?.url}
            aria-label={playing ? "暂停" : "播放"}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:opacity-90 disabled:opacity-40"
          >
            {playing ? (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M8 5v14l11-7L8 5z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={playNext}
            aria-label="下一首"
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-background hover:text-foreground"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M16 18h2V6h-2v12zM6 18l8.5-6L6 6v12z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setListOpen((v) => !v)}
            aria-label={listOpen ? "收起列表" : "展开列表"}
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-muted transition hover:bg-background hover:text-foreground"
          >
            <svg
              className={`h-4 w-4 transition-transform ${listOpen ? "rotate-180" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      {/* Track list */}
      {listOpen ? (
        <div className="max-h-64 overflow-y-auto border-t border-border">
          <ul className="divide-y divide-border">
            {tracks.map((t, i) => (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => playTrack(i)}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-background ${
                    i === currentIdx ? "bg-primary/5 text-primary" : ""
                  }`}
                >
                  <span className="w-5 shrink-0 text-right font-mono text-[10px] text-muted">
                    {i === currentIdx && playing ? (
                      <span className="inline-block animate-pulse">▶</span>
                    ) : (
                      i + 1
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{t.title}</span>
                  <span className="shrink-0 truncate text-xs text-muted">
                    {t.artist}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-muted">
                    {formatTime(t.duration)}
                  </span>
                  {!t.url ? (
                    <span className="shrink-0 text-[10px] text-muted/60">
                      无音频
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
