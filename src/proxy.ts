import { NextResponse, type NextRequest } from "next/server";
import { auth, ADMIN_LOGIN } from "@/auth";

/**
 * Per-request CSP nonce + preview-deployment/admin gate.
 *
 * Next.js 16 renamed the `middleware` convention to `proxy`; keep this file
 * narrow so public ISR pages stay cacheable. Public routes use the static CSP
 * from next.config.ts, while admin/search/cron routes get a strict nonce CSP.
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

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  response.headers.set("Content-Security-Policy", csp);
  return response;
}

export default auth((req) => withStrictHeaders(req as AuthProxyRequest));

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/api/cron/:path*",
    "/search",
  ],
};
