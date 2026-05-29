const CACHE = "hypervoid-v8";
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

  // Media files and range requests must go straight to the network. Browsers
  // request video/audio with Range headers, and caching partial 206 responses
  // can make the Service Worker fail the whole load.
  if (
    request.headers.has("range") ||
    request.destination === "video" ||
    request.destination === "audio" ||
    url.pathname.match(/\.(?:mp4|webm|mov|m4v|mp3|m4a|ogg|wav|flac)$/i)
  ) {
    return;
  }

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

  // Let the browser handle everything else. This avoids stale or invalid SW
  // cache entries for large files and framework-generated assets.
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
