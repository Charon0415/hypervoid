import { getCustomTheme, renderThemeCss } from "@/lib/custom-theme";

/**
 * Inline <style> tag in <head> applying any DB-stored custom theme overrides.
 * Mounted in root layout; falls back to nothing when disabled or empty.
 */
export async function CustomThemeStyles() {
  const theme = await getCustomTheme().catch(() => null);
  if (!theme) return null;
  const css = renderThemeCss(theme);
  if (!css) return null;
  return <style data-source="custom-theme" dangerouslySetInnerHTML={{ __html: css }} />;
}
