import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.title,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#6366f1",
    orientation: "any",
    categories: ["blog", "personal"],
    lang: siteConfig.locale,
    dir: "ltr",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    screenshots: [
      {
        src: "/wallpapers/1.webp",
        sizes: "1920x1080",
        type: "image/webp",
        form_factor: "wide",
        label: `${siteConfig.name} 主页`,
      },
      {
        src: "/wallpapers/medieval.webp",
        sizes: "2560x1113",
        type: "image/webp",
        form_factor: "wide",
        label: "文章阅读",
      },
    ],
  };
}
