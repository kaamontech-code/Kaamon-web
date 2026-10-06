// KaamOn service worker: lets the app be installed and open quickly.
// Always tries the network first, so new versions you upload show up right away.
const CACHE = "kaamon-v2";
const SHELL = ["./", "index.html", "business.html", "worker.html", "manifest-business.webmanifest", "manifest-worker.webmanifest", "icon-192.png", "icon-512.png", "icon-business-192.png", "icon-business-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET") return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;            // leave Firebase and Google requests alone
  if (u.pathname.endsWith("admin.html")) return;       // admin page is never cached
  e.respondWith(
    fetch(r)
      .then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); return res; })
      .catch(() => caches.match(r).then(m => m || caches.match("index.html")))
  );
});
