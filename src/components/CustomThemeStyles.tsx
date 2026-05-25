import Image from "next/image";
import { getCustomTheme, renderThemeCss } from "@/lib/custom-theme";

/**
 * Inline <style> tag in <head> applying any DB-stored custom theme overrides:
 *  - CSS variable overrides (light + dark)
 *  - Background wallpaper for desktop & mobile via a fixed-positioned <div>
 *    rendered by the sibling <CustomWallpaper /> component below.
 */
export async function CustomThemeStyles() {
  const theme = await getCustomTheme().catch(() => null);
  if (!theme) return null;
  const css = renderThemeCss(theme);
  if (!css) return null;
  return (
    <style data-source="custom-theme" dangerouslySetInnerHTML={{ __html: css }} />
  );
}

/**
 * Renders the custom wallpaper as a fixed full-viewport image behind the
 * page. Uses two <img> tags with responsive visibility so desktop and
 * mobile can have separate wallpapers. Falls back gracefully when only one
 * is provided.
 */
export async function CustomWallpaper() {
  const theme = await getCustomTheme().catch(() => null);
  if (!theme || !theme.enabled) return null;

  const desktop = theme.wallpaperDesktop;
  const mobile = theme.wallpaperMobile ?? desktop;
  if (!desktop && !mobile) return null;

  const style = {
    opacity: Math.max(0, Math.min(100, theme.wallpaperOpacity)) / 100,
    filter: theme.wallpaperBlur > 0 ? `blur(${theme.wallpaperBlur}px)` : undefined,
  };

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {desktop ? (
        <Image
          src={desktop}
          alt=""
          fill
          sizes="100vw"
          priority
          className="hidden h-full w-full object-cover md:block"
          style={style}
        />
      ) : null}
      {mobile ? (
        <Image
          src={mobile}
          alt=""
          fill
          sizes="100vw"
          priority
          className="block h-full w-full object-cover md:hidden"
          style={style}
        />
      ) : null}
    </div>
  );
}
