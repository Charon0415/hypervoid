const CACHE = "hypervoid-v7";
const STATIC = ["/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(STATIC)).finally(() => {
      self.skipWaiting();
    }),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
      await self.clients.claim();
      const clients = await self.clients.matchAll({ type: "window" });
      for (const client of clients) client.postMessage("reload");
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "skip-waiting") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept Next build assets. Stale SW responses for content-hashed
  // chunks are the fastest way to break CSS/JS after a rebuild or deploy.
  if (url.pathname.startsWith("/_next/")) return;

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  if (request.headers.get("Accept")?.includes("text/html")) {
    event.respondWith(networkOnlyPage(request));
    return;
  }

  if (url.pathname.match(/\.(?:woff2?|ttf|otf|png|jpe?g|gif|webp|avif|svg|ico)$/i)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
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
