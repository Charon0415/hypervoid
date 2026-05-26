"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type Track = {
  id: number;
  title: string;
  artist: string;
  cover: string;
  duration: number; // ms
  url: string | null;
};

export type RepeatMode = "off" | "all" | "one";

type PlayerState = {
  tracks: Track[];
  currentIdx: number;
  playing: boolean;
  currentTime: number; // ms
  duration: number; // ms
  volume: number; // 0..1
  muted: boolean;
  repeatMode: RepeatMode;
  shuffle: boolean;
  tracksLoaded: boolean;
  loading: boolean;
  error: string | null;
};

type PlayerActions = {
  ensureTracksLoaded: () => Promise<void>;
  setTracks: (tracks: Track[]) => void;
  playAt: (idx: number) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  seek: (ms: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
};

type PlayerContextValue = PlayerState & PlayerActions & {
  current: Track | null;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

const VOLUME_KEY = "hypervoid:player:volume";
const MUTED_KEY = "hypervoid:player:muted";
const REPEAT_KEY = "hypervoid:player:repeat";
const SHUFFLE_KEY = "hypervoid:player:shuffle";

function loadFloat(key: string, fallback: number): number {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
}

function loadBool(key: string, fallback: boolean): boolean {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : raw === "true";
  } catch {
    return fallback;
  }
}

function loadRepeat(): RepeatMode {
  if (typeof window === "undefined") return "off";
  try {
    const raw = localStorage.getItem(REPEAT_KEY);
    return raw === "all" || raw === "one" ? raw : "off";
  } catch {
    return "off";
  }
}

export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const shuffleOrderRef = useRef<number[]>([]);
  const shuffleCursorRef = useRef(0);

  const [tracks, setTracksState] = useState<Track[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.7);
  const [muted, setMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>("off");
  const [shuffle, setShuffle] = useState(false);
  const [tracksLoaded, setTracksLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore persisted settings once on mount
  useEffect(() => {
    setVolumeState(loadFloat(VOLUME_KEY, 0.7));
    setMuted(loadBool(MUTED_KEY, false));
    setRepeatMode(loadRepeat());
    setShuffle(loadBool(SHUFFLE_KEY, false));
  }, []);

  // Lazy-create the singleton audio element
  useEffect(() => {
    if (audioRef.current) return;
    const a = new Audio();
    a.preload = "metadata";
    a.volume = volume;
    a.muted = muted;
    audioRef.current = a;
    return () => {
      a.pause();
      a.src = "";
      audioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync volume/muted into audio element
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
    try {
      localStorage.setItem(VOLUME_KEY, String(volume));
    } catch {
      /* noop */
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
    try {
      localStorage.setItem(MUTED_KEY, String(muted));
    } catch {
      /* noop */
    }
  }, [muted]);

  // Persist mode toggles
  useEffect(() => {
    try {
      localStorage.setItem(REPEAT_KEY, repeatMode);
    } catch {
      /* noop */
    }
  }, [repeatMode]);

  useEffect(() => {
    try {
      localStorage.setItem(SHUFFLE_KEY, String(shuffle));
    } catch {
      /* noop */
    }
  }, [shuffle]);

  // Build (or rebuild) the shuffle order whenever tracks or shuffle toggles
  useEffect(() => {
    if (!shuffle || tracks.length === 0) {
      shuffleOrderRef.current = [];
      shuffleCursorRef.current = 0;
      return;
    }
    const order = tracks.map((_, i) => i).filter((i) => i !== currentIdx);
    for (let i = order.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [order[i], order[j]] = [order[j], order[i]];
    }
    shuffleOrderRef.current = order;
    shuffleCursorRef.current = 0;
  }, [shuffle, tracks, currentIdx]);

  const current = tracks[currentIdx] ?? null;

  const setTracks = useCallback((next: Track[]) => {
    setTracksState(next);
    setTracksLoaded(true);
    setCurrentIdx(0);
  }, []);

  const ensureTracksLoaded = useCallback(async () => {
    if (tracksLoaded || loading) return;
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/music/playlist");
      if (!r.ok) {
        const j = await r.json().catch(() => null);
        throw new Error(j?.error ?? `HTTP ${r.status}`);
      }
      const data = (await r.json()) as { tracks?: Track[] };
      if (data.tracks && data.tracks.length > 0) {
        setTracks(data.tracks);
      } else {
        setError("歌单为空");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载失败");
    } finally {
      setLoading(false);
    }
  }, [tracksLoaded, loading, setTracks]);

  const playAt = useCallback((idx: number) => {
    setCurrentIdx(idx);
    setPlaying(true);
  }, []);

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a || !current?.url) return;
    if (a.paused) {
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      a.pause();
      setPlaying(false);
    }
  }, [current?.url]);

  const next = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentIdx((prev) => {
      if (shuffle) {
        const order = shuffleOrderRef.current;
        if (order.length === 0) return prev;
        const idx = shuffleCursorRef.current % order.length;
        shuffleCursorRef.current = idx + 1;
        return order[idx];
      }
      return (prev + 1) % tracks.length;
    });
    setPlaying(true);
  }, [tracks.length, shuffle]);

  const prev = useCallback(() => {
    if (tracks.length === 0) return;
    setCurrentIdx((p) => (p - 1 + tracks.length) % tracks.length);
    setPlaying(true);
  }, [tracks.length]);

  const seek = useCallback((ms: number) => {
    const a = audioRef.current;
    if (!a || !Number.isFinite(ms)) return;
    a.currentTime = Math.max(0, ms / 1000);
    setCurrentTime(a.currentTime * 1000);
  }, []);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    setVolumeState(clamped);
    if (clamped > 0 && muted) setMuted(false);
  }, [muted]);

  const toggleMute = useCallback(() => setMuted((m) => !m), []);
  const toggleShuffle = useCallback(() => setShuffle((s) => !s), []);
  const cycleRepeat = useCallback(() => {
    setRepeatMode((m) => (m === "off" ? "all" : m === "all" ? "one" : "off"));
  }, []);

  // Load current track's audio source and play if needed
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (!current?.url) {
      a.removeAttribute("src");
      a.load();
      setCurrentTime(0);
      setDuration(0);
      return;
    }
    if (a.src !== current.url) {
      a.src = current.url;
      a.load();
      setCurrentTime(0);
    }
    if (playing) {
      a.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id, current?.url]);

  // Toggle play/pause when `playing` state flips externally (e.g. via togglePlay)
  // Audio is the source of truth, but we sync if there's a mismatch.
  useEffect(() => {
    const a = audioRef.current;
    if (!a || !current?.url) return;
    if (playing && a.paused) {
      a.play().catch(() => setPlaying(false));
    } else if (!playing && !a.paused) {
      a.pause();
    }
  }, [playing, current?.url]);

  // Wire audio element events
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setCurrentTime(a.currentTime * 1000);
    const onMeta = () => setDuration((a.duration || 0) * 1000);
    const onPause = () => setPlaying(false);
    const onPlay = () => setPlaying(true);
    const onEnded = () => {
      if (repeatMode === "one") {
        a.currentTime = 0;
        a.play().catch(() => {
          /* noop */
        });
        return;
      }
      if (shuffle) {
        next();
        return;
      }
      const isLast = currentIdx >= tracks.length - 1;
      if (isLast && repeatMode === "off") {
        setPlaying(false);
        a.currentTime = 0;
        return;
      }
      next();
    };
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("durationchange", onMeta);
    a.addEventListener("pause", onPause);
    a.addEventListener("play", onPlay);
    a.addEventListener("ended", onEnded);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("durationchange", onMeta);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("ended", onEnded);
    };
  }, [repeatMode, shuffle, currentIdx, tracks.length, next]);

  // Media Session API — lets the OS show track info and respond to media keys
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    if (!current) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: current.title,
      artist: current.artist,
      artwork: current.cover ? [{ src: current.cover, sizes: "300x300" }] : [],
    });
    navigator.mediaSession.setActionHandler("play", () => togglePlay());
    navigator.mediaSession.setActionHandler("pause", () => togglePlay());
    navigator.mediaSession.setActionHandler("nexttrack", () => next());
    navigator.mediaSession.setActionHandler("previoustrack", () => prev());
  }, [current, togglePlay, next, prev]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      tracks,
      currentIdx,
      playing,
      currentTime,
      duration,
      volume,
      muted,
      repeatMode,
      shuffle,
      tracksLoaded,
      loading,
      error,
      current,
      ensureTracksLoaded,
      setTracks,
      playAt,
      togglePlay,
      next,
      prev,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
    }),
    [
      tracks,
      currentIdx,
      playing,
      currentTime,
      duration,
      volume,
      muted,
      repeatMode,
      shuffle,
      tracksLoaded,
      loading,
      error,
      current,
      ensureTracksLoaded,
      setTracks,
      playAt,
      togglePlay,
      next,
      prev,
      seek,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
    ],
  );

  return (
    <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) {
    throw new Error("usePlayer must be used within PlayerProvider");
  }
  return ctx;
}

/**
 * Same as usePlayer but returns null when outside the provider, so
 * components can render gracefully if mounted before the provider
 * (or used in pages where the provider isn't wrapping yet).
 */
export function usePlayerOptional(): PlayerContextValue | null {
  return useContext(PlayerContext);
}
