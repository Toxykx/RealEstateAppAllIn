// Minimal service worker: enough for PWA installability + a basic offline
// shell. Not an offline-first rewrite — static assets are cache-first,
// everything else (pages, API/data) is network-first with a cached fallback,
// falling back to /offline only when a full page navigation has no network
// and nothing cached yet.
const CACHE_NAME = "allin-shell-v1";
const OFFLINE_URL = "/offline";
const PRECACHE_URLS = [OFFLINE_URL];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isStaticAsset = url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/_next/image");

  if (isStaticAsset) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      }),
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.open(CACHE_NAME).then((cache) => cache.match(OFFLINE_URL))),
    );
  }
});

self.addEventListener("push", (event) => {
  if (!event.data) return;
  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: "ALL IN Real Estate", body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || "ALL IN Real Estate", {
      body: payload.body,
      icon: "/icon",
      badge: "/icon",
      dir: "rtl",
      data: { url: payload.url || "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(url);
    }),
  );
});
