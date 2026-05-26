const CACHE = "hypervoid-v6";
// Pre-cache the offline page only — HTML pages must NOT be pre-cached
// because their JS chunk references change with every deploy.
const STATIC = [
  "/offline",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(STATIC)).finally(() => {
      self.skipWaiting();
    }),
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      // Purge old caches
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
      );
      // Take control of all clients and tell them to reload
      await self.clients.claim();
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) {
        client.postMessage("reload");
      }
    })(),
  );
});

// Handle skip-waiting message from the page
self.addEventListener("message", (event) => {
  if (event.data === "skip-waiting") {
    self.skipWaiting();
  }
});

/**
 * Routing:
 *   - /api/*           → network-first (fresh DB data; cache fallback when offline)
 *   - HTML pages       → network-only + offline fallback (JS chunk references
 *                        change every deploy; stale HTML causes page load
 *                        failures after client-side navigation)
 *   - /_next/static/*, fonts, images → cache-first (versioned by content hash)
 */
self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // API: network-first, with cache fallback for offline reads.
  if (url.pathname.startsWith("/api/")) {
    e.respondWith(networkFirst(request));
    return;
  }

  // HTML must not be cached. Old HTML can reference deleted Next chunks.
  if (request.headers.get("Accept")?.includes("text/html")) {
    e.respondWith(networkOnlyPage(request));
    return;
  }

  // Versioned static assets: cache-first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/fonts/") ||
    url.pathname.match(/\.(?:woff2?|ttf|otf|png|jpe?g|gif|webp|avif|svg|ico)$/i)
  ) {
    e.respondWith(cacheFirst(request));
    return;
  }

  // Everything else: stale-while-revalidate
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

async function networkOnlyPage(request) {
  try {
    return await fetch(request);
  } catch {
    const cache = await caches.open(CACHE);
    return (await cache.match("/offline")) || Response.error();
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
