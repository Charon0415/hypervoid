import { NextResponse, type NextRequest } from "next/server";
import { auth, ADMIN_LOGIN } from "@/auth";

/**
 * Next.js 16 proxy — runs on ALL routes.
 *
 * 1. Fixes a Next.js 16 bug where the browser sends
 *    Next-Router-State-Tree: [""] which fails server-side schema validation.
 * 2. Applies per-request nonce CSP on admin/search/cron routes.
 * 3. Gates admin routes behind auth.
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

type AuthProxyRequest = NextRequest & {
  auth?: {
    user?: {
      login?: string | null;
      isAdmin?: boolean | null;
    };
  } | null;
};

function denyUnauthorized(req: AuthProxyRequest) {
  const { pathname } = req.nextUrl;
  const isAdminPath = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  if ((!isAdminPath && !isAdminApi) || pathname === "/admin/sign-in") {
    return null;
  }

  const user = req.auth?.user;
  const allowed = user?.isAdmin === true || user?.login === ADMIN_LOGIN;
  if (allowed) return null;

  if (isAdminApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = req.nextUrl.clone();
  const signInUrl = new URL("/admin/sign-in", url);
  signInUrl.searchParams.set("callbackUrl", url.pathname + url.search);
  if (user) signInUrl.searchParams.set("error", "AccessDenied");
  return NextResponse.redirect(signInUrl);
}

function withStrictHeaders(req: AuthProxyRequest) {
  const { pathname } = req.nextUrl;
  const isAdminOrSearch =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/cron") ||
    pathname === "/search";

  // Fix malformed Next-Router-State-Tree header (Next.js 16 bug).
  // The browser sometimes sends [""] which fails schema validation;
  // the server requires ["", {}] at minimum.
  const requestHeaders = new Headers(req.headers);
  const stateTree = requestHeaders.get("Next-Router-State-Tree");
  if (stateTree) {
    try {
      const decoded = decodeURIComponent(stateTree);
      const parsed = JSON.parse(decoded);
      if (Array.isArray(parsed) && parsed.length === 1) {
        // Bare segment like [""] — add empty parallel routes object
        parsed.push({});
        requestHeaders.set(
          "Next-Router-State-Tree",
          encodeURIComponent(JSON.stringify(parsed)),
        );
      }
    } catch {
      // If parsing fails, leave as-is and let Next.js handle it
    }
  }

  // Admin/search/cron routes get strict nonce CSP + auth gate.
  if (isAdminOrSearch) {
    const unauthorized = denyUnauthorized(req);
    if (unauthorized) return unauthorized;

    if (process.env.VERCEL_ENV === "preview") {
      const previewSecret = process.env.PREVIEW_SECRET;
      const cookie = req.cookies.get("__hypervoid_preview")?.value;
      if (cookie !== previewSecret || !previewSecret) {
        return new NextResponse("Preview - admin disabled", { status: 403 });
      }
    }

    const nonce = btoa(crypto.randomUUID());
    const scriptSrc = `script-src 'self' 'nonce-${nonce}' ${SCRIPT_HOSTS}`;
    const csp = [...COMMON_DIRECTIVES, scriptSrc].join("; ");

    requestHeaders.set("x-nonce", nonce);
    requestHeaders.set("Content-Security-Policy", csp);

    const response = NextResponse.next({
      request: { headers: requestHeaders },
    });
    response.headers.set("Content-Security-Policy", csp);
    return response;
  }

  // Public routes — pass through with fixed headers, no CSP override.
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export default auth((req) => withStrictHeaders(req as AuthProxyRequest));

export const config = {
  matcher: [
    // Match all routes so we can fix the router state tree header everywhere.
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
