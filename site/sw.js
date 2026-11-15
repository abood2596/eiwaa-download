// إيواء: يحفظ الصفحة للفتح بدون إنترنت. الصفحة من الشبكة أولًا، والملفات الثابتة من الحفظ.
const V = 'eiwaa-v3';
const CORE = ['/', '/index.html', '/manifest.webmanifest', '/img/icon-192.png', '/fonts/plex_regular.woff2', '/fonts/plex_semibold.woff2', '/fonts/plex_bold.woff2', '/fonts/plex_light.woff2', '/fonts/plex_mono.woff2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || /\.(mp4|apk)$/.test(u.pathname)) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then(res => { const c = res.clone(); caches.open(V).then(x => x.put('/', c)); return res; }).catch(() => caches.match('/')));
    return;
  }
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); } return res; })));
});
