import type { NextConfig } from "next";
import path from "node:path";

const csp = [
  "default-src 'self'",
  // 'unsafe-inline' is still required by next-themes' inline hydration script
  // and by Giscus / Umami inline init. 'unsafe-eval' was dropped in v1.6
  // after audit — Next 16 + React 19 don't need runtime eval, and we
  // verified Mermaid + Live2D Cubism 2 runtime don't either.
  "script-src 'self' 'unsafe-inline' https://giscus.app https://cloud.umami.is https://umami.hypervoid.top",
  "style-src 'self' 'unsafe-inline' https://giscus.app",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "frame-src https://giscus.app https://www.youtube.com https://player.bilibili.com",
  "connect-src 'self' https://cloud.umami.is https://umami.hypervoid.top https://giscus.app https://api.bgm.tv https://api.anthropic.com",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  experimental: {
    viewTransition: true,
  },
  // Lets next/image proxy + auto-resize covers/avatars from these hosts.
  // The Vercel Image Optimization API will fetch, resize, and serve modern
  // formats (AVIF/WebP) — saving the bandwidth + LCP cost of returning raw
  // 1-5MB originals at 128px display widths.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lain.bgm.tv" },
      { protocol: "https", hostname: "cdn.cloudflare.steamstatic.com" },
    ],
  },
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "X-XSS-Protection", value: "0" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
        { key: "Content-Security-Policy", value: csp },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      ],
    },
  ],
};

export default nextConfig;
