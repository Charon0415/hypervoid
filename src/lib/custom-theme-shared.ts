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

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

function isValidHex(v: unknown): v is string {
  return typeof v === "string" && HEX_RE.test(v.trim());
}

/** Sanitize and validate theme input. Returns a clean object safe for DB storage. */
export function sanitizeThemeInput(input: {
  enabled: boolean;
  light: Record<string, unknown>;
  dark: Record<string, unknown>;
  wallpaperDesktop: string | null;
  wallpaperMobile: string | null;
  wallpaperOpacity: number;
  wallpaperBlur: number;
}): {
  enabled: boolean;
  light: ThemeColors;
  dark: ThemeColors;
  wallpaperDesktop: string | null;
  wallpaperMobile: string | null;
  wallpaperOpacity: number;
  wallpaperBlur: number;
} {
  const allowedKeys = new Set<string>(THEME_KEYS);

  function cleanColors(obj: Record<string, unknown>): ThemeColors {
    const out: ThemeColors = {};
    for (const [k, v] of Object.entries(obj)) {
      if (!allowedKeys.has(k)) continue;
      if (typeof v === "string" && isValidHex(v)) {
        out[k as ThemeKey] = v.trim().toLowerCase();
      }
    }
    return out;
  }

  function sanitizeUrl(v: unknown): string | null {
    if (v === null || v === undefined) return null;
    if (typeof v !== "string") return null;
    const trimmed = v.trim();
    if (!trimmed) return null;
    // Only allow http(s) and relative paths
    if (/^https?:\/\//.test(trimmed) || trimmed.startsWith("/")) return trimmed;
    return null;
  }

  return {
    enabled: Boolean(input.enabled),
    light: cleanColors(input.light as Record<string, unknown>),
    dark: cleanColors(input.dark as Record<string, unknown>),
    wallpaperDesktop: sanitizeUrl(input.wallpaperDesktop),
    wallpaperMobile: sanitizeUrl(input.wallpaperMobile),
    wallpaperOpacity: Math.max(0, Math.min(100, Number(input.wallpaperOpacity) || 0)),
    wallpaperBlur: Math.max(0, Math.min(20, Number(input.wallpaperBlur) || 0)),
  };
}

/** Build a CSS string that overrides the variables when the theme is enabled. */
export function renderThemeCss(theme: CustomThemeRow): string {
  if (!theme.enabled) return "";
  const lightDecls = Object.entries(theme.light)
    .filter(([k, v]) => (THEME_KEYS as readonly string[]).includes(k) && isValidHex(v))
    .map(([k, v]) => `  --${k}: ${(v as string).trim().toLowerCase()};`)
    .join("\n");
  const darkDecls = Object.entries(theme.dark)
    .filter(([k, v]) => (THEME_KEYS as readonly string[]).includes(k) && isValidHex(v))
    .map(([k, v]) => `  --${k}: ${(v as string).trim().toLowerCase()};`)
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
