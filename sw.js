// StratoFil3D · la app abre sin internet con la última versión guardada; los datos siempre vienen de tu hoja.
const VERSION = 'sf3d-v9';
const V = '?v=9';
const SHELL = ['./', './index.html', './app.css' + V, './datos.js' + V, './docs.js' + V, './app.js' + V, './hojas.js' + V,
  './manifest.webmanifest', './logo-oscuro.png', './logo-claro.png', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
const guardar = (req, res) => { if (res && (res.ok || res.type === 'opaque')) { const c = res.clone(); caches.open(VERSION).then(x => x.put(req, c)).catch(() => {}); } return res; };
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.hostname.includes('script.google')) return;
  if (url.origin === location.origin) {
    // Primero la red (para recibir actualizaciones); sin internet, la copia guardada.
    e.respondWith(fetch(req).then(r => guardar(req, r))
      .catch(() => caches.match(req).then(r => r || caches.match(req, { ignoreSearch: true })).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error()))));
  } else if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => guardar(req, res))));
  }
});
