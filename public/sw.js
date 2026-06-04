/* Mulbox.ch – minimalny service worker dla trybu PWA. */
const CACHE = "mulbox-v2";
const ASSETS = ["/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => null));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Nigdy nie keszuj API, auth, dashboard, admin ani requestów cross-origin (Supabase, Stripe, itp.).
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") ||
      url.pathname.startsWith("/dashboard") ||
      url.pathname.startsWith("/admin") ||
      url.pathname.startsWith("/login") ||
      url.pathname.startsWith("/register")) return;

  // Network-first dla HTML (nawigacja) – żeby po deployu user zawsze dostał świeży build.
  const isHTML = req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");
  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => null);
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // Cache-first dla statycznych assetów (_next/static, obrazki, manifest, icon).
  event.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => null);
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
