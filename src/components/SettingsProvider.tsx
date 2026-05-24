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
  | "particles";

export type FontKey = "geist" | "serif" | "handwriting";

export const DEFAULT_HUE = 240;
export const DEFAULT_BACKGROUND: BackgroundKey = "cosmic";
export const DEFAULT_FONT: FontKey = "geist";

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
  { key: "plain", label: "纯净" },
  { key: "paper", label: "纸质" },
  { key: "waves", label: "波纹" },
];

export const FONT_OPTIONS: { key: FontKey; label: string }[] = [
  { key: "geist", label: "Geist" },
  { key: "serif", label: "Serif" },
  { key: "handwriting", label: "手写" },
];

const HUE_KEY = "hypervoid:hue";
const BG_KEY = "hypervoid:bg";
const FONT_KEY = "hypervoid:font";

type SettingsValue = {
  hue: number;
  background: BackgroundKey;
  font: FontKey;
  setHue: (v: number) => void;
  setBackground: (v: BackgroundKey) => void;
  setFont: (v: FontKey) => void;
  reset: () => void;
};

const SettingsContext = createContext<SettingsValue>({
  hue: DEFAULT_HUE,
  background: DEFAULT_BACKGROUND,
  font: DEFAULT_FONT,
  setHue: () => {},
  setBackground: () => {},
  setFont: () => {},
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

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [hue, setHueState] = useState<number>(DEFAULT_HUE);
  const [background, setBackgroundState] =
    useState<BackgroundKey>(DEFAULT_BACKGROUND);
  const [font, setFontState] = useState<FontKey>(DEFAULT_FONT);

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

  const reset = useCallback(() => {
    setHue(DEFAULT_HUE);
    setBackground(DEFAULT_BACKGROUND);
    setFont(DEFAULT_FONT);
    try {
      localStorage.removeItem(HUE_KEY);
      localStorage.removeItem(BG_KEY);
      localStorage.removeItem(FONT_KEY);
    } catch {
      /* ignore */
    }
  }, [setHue, setBackground, setFont]);

  return (
    <SettingsContext.Provider
      value={{ hue, background, font, setHue, setBackground, setFont, reset }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
