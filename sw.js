/* Service Worker ПК-версии: офлайн-оболочка, данные всегда с сервера. */
const CACHE = 'raskroi-pc2';
const ASSETS = ['./', './index.html', './styles.css', './app.js', './config.js', './manifest.json'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => {
        const old = keys.filter((k) => k !== CACHE);
        return Promise.all(old.map((k) => caches.delete(k))).then(() => old.length);
      })
      .then((n) => self.clients.claim().then(() => n))
      .then((n) => {
        if (!n) return;
        return self.clients.matchAll({ type: 'window' }).then((clients) => {
          clients.forEach((c) => { try { c.navigate(c.url); } catch (err) {} });
        });
      })
  );
});
self.addEventListener('fetch', (e) => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.startsWith('/api/')) return;
  e.respondWith(
    caches.match(e.request).then(
      (r) =>
        r ||
        fetch(e.request).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return res;
        }).catch(() => caches.match('./index.html'))
    )
  );
});
