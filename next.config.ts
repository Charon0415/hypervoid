import type { NextConfig } from "next";
import path from "node:path";

// CSP is now set per-request by src/middleware.ts so admin/api routes
// get a stricter nonce-based policy without 'unsafe-inline', while
// ISR-cached routes keep 'unsafe-inline' (cached HTML can't carry a
// matching per-request nonce). Other security headers stay here.

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
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      ],
    },
  ],
};

export default nextConfig;
