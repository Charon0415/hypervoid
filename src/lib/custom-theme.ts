import "server-only";

import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db/client";
import type {
  CustomThemeRow,
  ThemeColors,
} from "@/lib/custom-theme-shared";

export type { CustomThemeRow, ThemeColors, ThemeKey } from "@/lib/custom-theme-shared";
export { THEME_KEYS, renderThemeCss } from "@/lib/custom-theme-shared";

const FALLBACK: CustomThemeRow = {
  enabled: false,
  light: {},
  dark: {},
  wallpaperDesktop: null,
  wallpaperMobile: null,
  wallpaperOpacity: 100,
  wallpaperBlur: 0,
  updatedAt: new Date(0),
};

let _cache: CustomThemeRow | null = null;
let _cacheAt = 0;

export async function getCustomTheme(): Promise<CustomThemeRow> {
  const now = Date.now();
  if (_cache && now - _cacheAt < 60_000) return _cache;

  try {
    const rows = await getDb()
      .select()
      .from(schema.customTheme)
      .where(eq(schema.customTheme.id, 1))
      .limit(1);
    if (rows[0]) {
      _cache = {
        enabled: rows[0].enabled,
        light: (rows[0].light as ThemeColors) ?? {},
        dark: (rows[0].dark as ThemeColors) ?? {},
        wallpaperDesktop: rows[0].wallpaperDesktop,
        wallpaperMobile: rows[0].wallpaperMobile,
        wallpaperOpacity: rows[0].wallpaperOpacity,
        wallpaperBlur: rows[0].wallpaperBlur,
        updatedAt: rows[0].updatedAt,
      };
      _cacheAt = now;
      return _cache;
    }
  } catch {
    // db unavailable
  }
  return FALLBACK;
}

export async function saveCustomTheme(input: {
  enabled: boolean;
  light: ThemeColors;
  dark: ThemeColors;
  wallpaperDesktop: string | null;
  wallpaperMobile: string | null;
  wallpaperOpacity: number;
  wallpaperBlur: number;
}): Promise<void> {
  await getDb()
    .insert(schema.customTheme)
    .values({
      id: 1,
      enabled: input.enabled,
      light: input.light,
      dark: input.dark,
      wallpaperDesktop: input.wallpaperDesktop,
      wallpaperMobile: input.wallpaperMobile,
      wallpaperOpacity: input.wallpaperOpacity,
      wallpaperBlur: input.wallpaperBlur,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.customTheme.id,
      set: {
        enabled: input.enabled,
        light: input.light,
        dark: input.dark,
        wallpaperDesktop: input.wallpaperDesktop,
        wallpaperMobile: input.wallpaperMobile,
        wallpaperOpacity: input.wallpaperOpacity,
        wallpaperBlur: input.wallpaperBlur,
        updatedAt: new Date(),
      },
    });
  _cache = null;
}
