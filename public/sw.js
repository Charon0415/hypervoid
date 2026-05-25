const CACHE = "hypervoid-v3";
const STATIC = [
  "/",
  "/posts",
  "/rss.xml",
  "/offline",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(STATIC)).catch(() => {}),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
      ),
    ),
  );
  self.clients.claim();
});

/**
 * Routing:
 *   - /api/*   → network-first (always fresh DB data; fall back to cache offline)
 *   - /_next/static/*, fonts, images → cache-first (versioned by build, safe to keep)
 *   - HTML / everything else → stale-while-revalidate (instant first paint, refresh in bg)
 */
self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/api/")) {
    e.respondWith(networkFirst(request));
    return;
  }

  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.match(/\.(?:woff2?|ttf|otf|png|jpe?g|gif|webp|avif|svg|ico)$/i)
  ) {
    e.respondWith(cacheFirst(request));
    return;
  }

  e.respondWith(staleWhileRevalidate(request));
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE);
  try {
    const fresh = await fetch(request);
    if (fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

async function cacheFirst(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  if (hit) return hit;
  const fresh = await fetch(request);
  if (fresh.ok) cache.put(request, fresh.clone());
  return fresh;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE);
  const hit = await cache.match(request);
  const fetchAndCache = fetch(request)
    .then((res) => {
      if (res.ok) cache.put(request, res.clone());
      return res;
    })
    .catch(() => hit);
  return hit || fetchAndCache;
}
