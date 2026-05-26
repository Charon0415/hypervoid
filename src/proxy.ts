import { NextResponse, type NextRequest } from "next/server";
import { auth, ADMIN_LOGIN } from "@/auth";

/**
 * Next.js 16 proxy — runs on ALL routes.
 *
 * 1. Fixes a Next.js 16 bug where the browser sends
 *    Next-Router-State-Tree: [""] which fails server-side schema validation.
 *    Must bypass the `auth(handler)` wrapper because next-auth's
 *    `new Response(body, response)` (lib/index.js:166) drops the internal
 *    `request` field that `NextResponse.next({ request: { headers } })` uses
 *    to signal a request-header override — wiping out the rewrite silently.
 * 2. Applies per-request nonce CSP on admin/search/cron routes.
 * 3. Gates admin routes behind auth (called directly, no wrapper).
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

function fixRouterStateTree(srcHeaders: Headers): Headers {
  const out = new Headers(srcHeaders);
  const stateTree = out.get("next-router-state-tree");
  if (!stateTree) return out;
  try {
    const parsed = JSON.parse(decodeURIComponent(stateTree));
    if (Array.isArray(parsed) && parsed.length === 1) {
      parsed.push({});
      out.set(
        "next-router-state-tree",
        encodeURIComponent(JSON.stringify(parsed)),
      );
    }
  } catch {
    // Parsing failed — leave as-is and let Next.js handle it.
  }
  return out;
}

async function denyUnauthorized(req: NextRequest): Promise<NextResponse | null> {
  const { pathname } = req.nextUrl;
  const isAdminPath = pathname.startsWith("/admin");
  const isAdminApi = pathname.startsWith("/api/admin");
  if ((!isAdminPath && !isAdminApi) || pathname === "/admin/sign-in") {
    return null;
  }

  const session = await auth();
  const user = session?.user as
    | { login?: string | null; isAdmin?: boolean | null }
    | undefined;
  const allowed = user?.isAdmin === true || user?.login === ADMIN_LOGIN;
  if (allowed) return null;

  if (isAdminApi) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const signInUrl = new URL("/admin/sign-in", req.nextUrl);
  signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname + req.nextUrl.search);
  if (user) signInUrl.searchParams.set("error", "AccessDenied");
  return NextResponse.redirect(signInUrl);
}

export default async function proxy(req: NextRequest): Promise<NextResponse> {
  const requestHeaders = fixRouterStateTree(req.headers);

  const { pathname } = req.nextUrl;
  const isAdminOrSearch =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/admin") ||
    pathname.startsWith("/api/cron") ||
    pathname === "/search";

  if (isAdminOrSearch) {
    const unauthorized = await denyUnauthorized(req);
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

  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
