"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export type BackgroundKey =
  | "cosmic"
  | "plain"
  | "paper"
  | "waves"
  | "particles"
  | "acg";

export type FontKey = "geist" | "serif" | "handwriting";

export type DisplayMode = "fullscreen" | "banner" | "simple";

export const DEFAULT_HUE = 240;
export const DEFAULT_BACKGROUND: BackgroundKey = "cosmic";
export const DEFAULT_FONT: FontKey = "geist";
export const DEFAULT_DISPLAY_MODE: DisplayMode = "fullscreen";

export const HUE_PRESETS: { name: string; hue: number }[] = [
  { name: "Indigo", hue: 240 },
  { name: "Sakura", hue: 340 },
  { name: "Ocean", hue: 200 },
  { name: "Forest", hue: 140 },
  { name: "Amber", hue: 35 },
  { name: "Violet", hue: 280 },
];

export const BACKGROUND_OPTIONS: { key: BackgroundKey; label: string }[] = [
  { key: "cosmic", label: "宇宙" },
  { key: "particles", label: "粒子" },
  { key: "acg", label: "ACG 轮播" },
  { key: "paper", label: "纸质" },
  { key: "waves", label: "波纹" },
  { key: "plain", label: "纯净" },
];

export const FONT_OPTIONS: { key: FontKey; label: string }[] = [
  { key: "geist", label: "Geist" },
  { key: "serif", label: "Serif" },
  { key: "handwriting", label: "手写" },
];

export const DISPLAY_MODE_OPTIONS: { key: DisplayMode; label: string; hint: string }[] = [
  { key: "fullscreen", label: "全屏", hint: "背景铺满整个视口（默认）" },
  { key: "banner", label: "横幅", hint: "仅在顶部条带显示" },
  { key: "simple", label: "简洁", hint: "完全隐藏背景特效" },
];

const HUE_KEY = "hypervoid:hue";
const BG_KEY = "hypervoid:bg";
const FONT_KEY = "hypervoid:font";
const DISPLAY_MODE_KEY = "hypervoid:display";

type SettingsValue = {
  hue: number;
  background: BackgroundKey;
  font: FontKey;
  displayMode: DisplayMode;
  setHue: (v: number) => void;
  setBackground: (v: BackgroundKey) => void;
  setFont: (v: FontKey) => void;
  setDisplayMode: (v: DisplayMode) => void;
  reset: () => void;
};

const SettingsContext = createContext<SettingsValue>({
  hue: DEFAULT_HUE,
  background: DEFAULT_BACKGROUND,
  font: DEFAULT_FONT,
  displayMode: DEFAULT_DISPLAY_MODE,
  setHue: () => {},
  setBackground: () => {},
  setFont: () => {},
  setDisplayMode: () => {},
  reset: () => {},
});

function applyHue(hue: number) {
  if (typeof document === "undefined") return;
  if (hue === DEFAULT_HUE) {
    document.documentElement.style.removeProperty("--primary");
  } else {
    document.documentElement.style.setProperty(
      "--primary",
      `hsl(${hue} 70% 60%)`,
    );
  }
}

function applyBackground(bg: BackgroundKey) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.bg = bg;
}

function applyFont(font: FontKey) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.font = font;
}

function applyDisplayMode(mode: DisplayMode) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.display = mode;
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [hue, setHueState] = useState<number>(DEFAULT_HUE);
  const [background, setBackgroundState] =
    useState<BackgroundKey>(DEFAULT_BACKGROUND);
  const [font, setFontState] = useState<FontKey>(DEFAULT_FONT);
  const [displayMode, setDisplayModeState] = useState<DisplayMode>(
    DEFAULT_DISPLAY_MODE,
  );

  useEffect(() => {
    try {
      const storedHue = localStorage.getItem(HUE_KEY);
      if (storedHue !== null) {
        const n = Number(storedHue);
        if (Number.isFinite(n)) {
          setHueState(n);
          applyHue(n);
        }
      }
      const storedBg = localStorage.getItem(BG_KEY) as BackgroundKey | null;
      if (storedBg && BACKGROUND_OPTIONS.some((o) => o.key === storedBg)) {
        setBackgroundState(storedBg);
        applyBackground(storedBg);
      } else {
        applyBackground(DEFAULT_BACKGROUND);
      }
      const storedFont = localStorage.getItem(FONT_KEY) as FontKey | null;
      if (storedFont && FONT_OPTIONS.some((o) => o.key === storedFont)) {
        setFontState(storedFont);
        applyFont(storedFont);
      } else {
        applyFont(DEFAULT_FONT);
      }
      const storedDisplay = localStorage.getItem(
        DISPLAY_MODE_KEY,
      ) as DisplayMode | null;
      if (
        storedDisplay &&
        DISPLAY_MODE_OPTIONS.some((o) => o.key === storedDisplay)
      ) {
        setDisplayModeState(storedDisplay);
        applyDisplayMode(storedDisplay);
      } else {
        applyDisplayMode(DEFAULT_DISPLAY_MODE);
      }
    } catch {
      // ignore
    }
  }, []);

  const setHue = useCallback((v: number) => {
    setHueState(v);
    applyHue(v);
    try {
      localStorage.setItem(HUE_KEY, String(v));
    } catch {
      /* ignore */
    }
  }, []);

  const setBackground = useCallback((v: BackgroundKey) => {
    setBackgroundState(v);
    applyBackground(v);
    try {
      localStorage.setItem(BG_KEY, v);
    } catch {
      /* ignore */
    }
  }, []);

  const setFont = useCallback((v: FontKey) => {
    setFontState(v);
    applyFont(v);
    try {
      localStorage.setItem(FONT_KEY, v);
    } catch {
      /* ignore */
    }
  }, []);

  const setDisplayMode = useCallback((v: DisplayMode) => {
    setDisplayModeState(v);
    applyDisplayMode(v);
    try {
      localStorage.setItem(DISPLAY_MODE_KEY, v);
    } catch {
      /* ignore */
    }
  }, []);

  const reset = useCallback(() => {
    setHue(DEFAULT_HUE);
    setBackground(DEFAULT_BACKGROUND);
    setFont(DEFAULT_FONT);
    setDisplayMode(DEFAULT_DISPLAY_MODE);
    try {
      localStorage.removeItem(HUE_KEY);
      localStorage.removeItem(BG_KEY);
      localStorage.removeItem(FONT_KEY);
      localStorage.removeItem(DISPLAY_MODE_KEY);
    } catch {
      /* ignore */
    }
  }, [setHue, setBackground, setFont, setDisplayMode]);

  return (
    <SettingsContext.Provider
      value={{
        hue,
        background,
        font,
        displayMode,
        setHue,
        setBackground,
        setFont,
        setDisplayMode,
        reset,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
