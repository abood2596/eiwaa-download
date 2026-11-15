// إيواء: يحفظ الصفحتين للفتح بدون إنترنت. الصفحات من الشبكة أولًا، والملفات الثابتة من الحفظ.
const V = 'eiwaa-v4';
const CORE = ['/', '/org/', '/a/e.css', '/a/e.js', '/manifest.webmanifest', '/img/icon.png', '/img/icon-192.png', '/img/01-today.webp',
  '/fonts/s-regular.woff2', '/fonts/s-bold.woff2', '/fonts/s-light.woff2', '/fonts/plex_mono.woff2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || /\.(mp4|apk|mp3)$/.test(u.pathname) || r.headers.has('range')) return;
  if (r.mode === 'navigate') {
    const key = u.pathname.startsWith('/org') ? '/org/' : '/';
    e.respondWith(fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(V).then(x => x.put(key, c)); } return res; }).catch(() => caches.match(key)));
    return;
  }
  // css/js: network first so a new release shows at once; everything else from the cache first
  if (/\.(css|js)$/.test(u.pathname)) {
    e.respondWith(fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); } return res; }).catch(() => caches.match(r)));
    return;
  }
  e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => { if (res.ok) { const c = res.clone(); caches.open(V).then(x => x.put(r, c)); } return res; })));
});
