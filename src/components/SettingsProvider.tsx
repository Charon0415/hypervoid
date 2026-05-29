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
  | "acg"
  | "medieval"
  | "cyberpunk";

export type FontKey = "geist" | "serif" | "handwriting";

export type FontSizeKey = "normal" | "large";

export type DisplayMode = "fullscreen" | "banner" | "simple";

export const DEFAULT_HUE = 215;
export const DEFAULT_BACKGROUND: BackgroundKey = "cosmic";
export const DEFAULT_FONT: FontKey = "geist";
export const DEFAULT_FONT_SIZE: FontSizeKey = "normal";
export const DEFAULT_DISPLAY_MODE: DisplayMode = "fullscreen";

export const FONT_SIZE_OPTIONS: { key: FontSizeKey; label: string; hint: string }[] = [
  { key: "normal", label: "标准", hint: "17.5px 基准（默认）" },
  { key: "large", label: "舒适", hint: "19.5px 基准，正文更宽敞" },
];

export const DISPLAY_MODE_OPTIONS: { key: DisplayMode; label: string; hint: string }[] = [
  { key: "fullscreen", label: "全屏", hint: "背景铺满整个视口（默认）" },
  { key: "banner", label: "横幅", hint: "仅在顶部条带显示" },
  { key: "simple", label: "简洁", hint: "完全隐藏背景特效" },
];

const HUE_KEY = "hypervoid:hue";
const BG_KEY = "hypervoid:bg";
const FONT_KEY = "hypervoid:font";
const FONT_SIZE_KEY = "hypervoid:font-size";
const DISPLAY_MODE_KEY = "hypervoid:display";
const SETTINGS_SCHEMA_KEY = "hypervoid:settings-schema";
const SETTINGS_SCHEMA_VERSION = "2";

type SettingsValue = {
  hue: number;
  background: BackgroundKey;
  font: FontKey;
  fontSize: FontSizeKey;
  displayMode: DisplayMode;
  setHue: (v: number) => void;
  setBackground: (v: BackgroundKey) => void;
  setFont: (v: FontKey) => void;
  setFontSize: (v: FontSizeKey) => void;
  setDisplayMode: (v: DisplayMode) => void;
  reset: () => void;
};

const SettingsContext = createContext<SettingsValue>({
  hue: DEFAULT_HUE,
  background: DEFAULT_BACKGROUND,
  font: DEFAULT_FONT,
  fontSize: DEFAULT_FONT_SIZE,
  displayMode: DEFAULT_DISPLAY_MODE,
  setHue: () => {},
  setBackground: () => {},
  setFont: () => {},
  setFontSize: () => {},
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

function applyFontSize(size: FontSizeKey) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.fontSize = size;
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
  const [fontSize, setFontSizeState] =
    useState<FontSizeKey>(DEFAULT_FONT_SIZE);
  const [displayMode, setDisplayModeState] = useState<DisplayMode>(
    DEFAULT_DISPLAY_MODE,
  );
  useEffect(() => {
    try {
      const migrated = localStorage.getItem(SETTINGS_SCHEMA_KEY) === SETTINGS_SCHEMA_VERSION;
      if (!migrated) {
        localStorage.removeItem(HUE_KEY);
        localStorage.removeItem(BG_KEY);
        localStorage.removeItem(FONT_KEY);
        localStorage.removeItem(DISPLAY_MODE_KEY);
        localStorage.setItem(SETTINGS_SCHEMA_KEY, SETTINGS_SCHEMA_VERSION);
      }

      setHueState(DEFAULT_HUE);
      setBackgroundState(DEFAULT_BACKGROUND);
      setFontState(DEFAULT_FONT);
      applyHue(DEFAULT_HUE);
      applyBackground(DEFAULT_BACKGROUND);
      applyFont(DEFAULT_FONT);

      const storedFontSize = localStorage.getItem(
        FONT_SIZE_KEY,
      ) as FontSizeKey | null;
      if (
        storedFontSize &&
        FONT_SIZE_OPTIONS.some((o) => o.key === storedFontSize)
      ) {
        setFontSizeState(storedFontSize);
        applyFontSize(storedFontSize);
      } else {
        applyFontSize(DEFAULT_FONT_SIZE);
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
      applyHue(DEFAULT_HUE);
      applyBackground(DEFAULT_BACKGROUND);
      applyFont(DEFAULT_FONT);
      applyFontSize(DEFAULT_FONT_SIZE);
      applyDisplayMode(DEFAULT_DISPLAY_MODE);
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

  const setBackground = useCallback(
    (v: BackgroundKey) => {
      setBackgroundState(v);
      applyBackground(v);
      try {
        localStorage.setItem(BG_KEY, v);
      } catch {
        /* ignore */
      }
      // Cyberpunk wallpaper is heavy and themed for the banner strip — force
      // banner mode so it doesn't dominate the whole page in fullscreen.
      if (v === "cyberpunk") {
        setDisplayModeState("banner");
        applyDisplayMode("banner");
        try {
          localStorage.setItem(DISPLAY_MODE_KEY, "banner");
        } catch {
          /* ignore */
        }
      }
    },
    [],
  );

  const setFont = useCallback((v: FontKey) => {
    setFontState(v);
    applyFont(v);
    try {
      localStorage.setItem(FONT_KEY, v);
    } catch {
      /* ignore */
    }
  }, []);

  const setFontSize = useCallback((v: FontSizeKey) => {
    setFontSizeState(v);
    applyFontSize(v);
    try {
      localStorage.setItem(FONT_SIZE_KEY, v);
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
    setFontSize(DEFAULT_FONT_SIZE);
    setDisplayMode(DEFAULT_DISPLAY_MODE);
    try {
      localStorage.removeItem(HUE_KEY);
      localStorage.removeItem(BG_KEY);
      localStorage.removeItem(FONT_KEY);
      localStorage.removeItem(FONT_SIZE_KEY);
      localStorage.removeItem(DISPLAY_MODE_KEY);
    } catch {
      /* ignore */
    }
  }, [setHue, setBackground, setFont, setFontSize, setDisplayMode]);

  return (
    <SettingsContext.Provider
      value={{
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
