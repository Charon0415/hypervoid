/** Color keys that the admin can override. Each maps to a CSS variable. */
export const THEME_KEYS = [
  "background",
  "foreground",
  "card",
  "muted",
  "border",
  "primary",
  "primary-foreground",
] as const;

export type ThemeKey = (typeof THEME_KEYS)[number];

export type ThemeColors = Partial<Record<ThemeKey, string>>;

export type CustomThemeRow = {
  enabled: boolean;
  light: ThemeColors;
  dark: ThemeColors;
  wallpaperDesktop: string | null;
  wallpaperMobile: string | null;
  wallpaperOpacity: number; // 0–100
  wallpaperBlur: number; // 0–20 (px)
  updatedAt: Date;
};

/** Build a CSS string that overrides the variables when the theme is enabled. */
export function renderThemeCss(theme: CustomThemeRow): string {
  if (!theme.enabled) return "";
  const lightDecls = Object.entries(theme.light)
    .filter(([k, v]) => (THEME_KEYS as readonly string[]).includes(k) && Boolean(v))
    .map(([k, v]) => `  --${k}: ${v};`)
    .join("\n");
  const darkDecls = Object.entries(theme.dark)
    .filter(([k, v]) => (THEME_KEYS as readonly string[]).includes(k) && Boolean(v))
    .map(([k, v]) => `  --${k}: ${v};`)
    .join("\n");
  let css = "";
  if (lightDecls) {
    css += `:root {\n${lightDecls}\n}\n`;
  }
  if (darkDecls) {
    css += `.dark {\n${darkDecls}\n}\n`;
  }
  return css;
}
