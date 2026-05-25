import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/auth";

/**
 * Per-request CSP + auth gate.
 *
 * Two CSP regimes:
 *   - **Strict** for routes that aren't ISR-cached (/admin/*, /api/*,
 *     /search). These get a per-request nonce and drop 'unsafe-inline'
 *     from script-src. Next.js auto-applies the nonce to framework
 *     inline scripts when middleware sets `x-nonce` on the request
 *     headers.
 *   - **Permissive** for everything else. Public ISR-cached pages still
 *     allow 'unsafe-inline' because cached HTML can't carry a matching
 *     per-request nonce — a strict CSP would block scripts on every
 *     cache hit.
 *
 * Side effects:
 *   - Generates the nonce once per request via crypto.randomUUID.
 *   - Mirrors the CSP on the response (browser enforces) and on the
 *     request (server components read via headers()).
 *   - Preserves the existing preview-deployment block for admin routes.
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

function isStrictRoute(pathname: string): boolean {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/cron") ||
    pathname === "/search"
  );
}

function buildCsp(opts: { nonce: string; strict: boolean }): string {
  const scriptSrc = opts.strict
    ? `script-src 'self' 'nonce-${opts.nonce}' ${SCRIPT_HOSTS}`
    : `script-src 'self' 'unsafe-inline' ${SCRIPT_HOSTS}`;
  return [...COMMON_DIRECTIVES, scriptSrc].join("; ");
}

export default auth(async (req: NextRequest) => {
  const { pathname } = req.nextUrl;

  // Preview-deployment guard — unchanged from v1.5.
  if (process.env.VERCEL_ENV === "preview") {
    const previewSecret = process.env.PREVIEW_SECRET;
    const cookie = req.cookies.get("__hypervoid_preview")?.value;
    if (cookie !== previewSecret || !previewSecret) {
      if (
        pathname.startsWith("/admin") ||
        pathname.startsWith("/api/admin") ||
        pathname.startsWith("/api/cron")
      ) {
        return new NextResponse("Preview — admin disabled", { status: 403 });
      }
    }
  }

  // Per-request nonce. Base64 is cheaper than full UUID for header weight.
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const strict = isStrictRoute(pathname);
  const csp = buildCsp({ nonce, strict });

  // Propagate nonce to RSC via the request headers so server components
  // can read it from `headers().get('x-nonce')` and attach to inline
  // <script> tags they emit.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", csp);
  return response;
});

export const config = {
  // Run on everything except Next.js static asset paths. Includes /admin,
  // /api/*, public pages, and the strict /search route.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|apple-icon|opengraph-image|manifest.webmanifest|sw.js).*)",
  ],
};
