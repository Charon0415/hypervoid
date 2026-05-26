import { NextResponse, type NextRequest } from "next/server";

/**
 * Per-request CSP nonce + preview-deployment gate.
 *
 * Only runs on routes that are never ISR-cached (/admin/*, /api/admin/*,
 * /api/cron/*, /search). These get a per-request nonce-based CSP and drop
 * 'unsafe-inline' from script-src.
 *
 * Public pages get their CSP from next.config.ts static headers so ISR
 * caching works — cached HTML can't carry a matching per-request nonce.
 *
 * The `auth()` wrapper was previously applied globally here, which forced
 * every route (including public ISR pages) to be fully dynamic. Auth is
 * now checked per-route via requireAdmin() / auth() in the route handler
 * or server component instead.
 */

const COMMON_DIRECTIVES = [
  "default-src 'self'",
  "style-src 'self' 'unsafe-inline' https://giscus.app",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "frame-src https://giscus.app https://www.youtube.com https://player.bilibili.com",
  "connect-src 'self' https://cloud.umami.is https://umami.hypervoid.top https://giscus.app https://api.bgm.tv https://api.anthropic.com https://api.deepseek.com https://api.iconify.design",
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
];

const SCRIPT_HOSTS =
  "https://giscus.app https://cloud.umami.is https://umami.hypervoid.top";

export default function middleware(req: NextRequest) {
  // Preview-deployment guard.
  if (process.env.VERCEL_ENV === "preview") {
    const previewSecret = process.env.PREVIEW_SECRET;
    const cookie = req.cookies.get("__hypervoid_preview")?.value;
    if (cookie !== previewSecret || !previewSecret) {
      return new NextResponse("Preview — admin disabled", { status: 403 });
    }
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const scriptSrc = `script-src 'self' 'nonce-${nonce}' ${SCRIPT_HOSTS}`;
  const csp = [...COMMON_DIRECTIVES, scriptSrc].join("; ");

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/cron/:path*",
    "/search",
  ],
};
