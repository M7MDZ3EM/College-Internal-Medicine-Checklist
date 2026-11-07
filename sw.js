/* Study Checklist service worker: network-first, so you always get the newest version.
   The saved copy is used ONLY when the network request fails (you are offline). */
const CACHE = 'study-checklist-v1';
const HOSTS = ['www.gstatic.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];
const INDEX = new URL('index.html', self.registration.scope).href;
const PRE = [INDEX,
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.all(PRE.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {}))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url), same = u.origin === location.origin;
  if (!same && !HOSTS.includes(u.hostname)) return; // Firebase data and sign-in calls are never touched
  const nav = r.mode === 'navigate';
  e.respondWith((async () => {
    try {
      let res = await fetch(same ? r.url : r, same ? { cache: 'no-cache' } : undefined); // revalidate, never a stale HTTP-cached copy
      if (nav && res.redirected) res = new Response(res.body, { status: 200, statusText: 'OK', headers: res.headers });
      if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(nav ? INDEX : r, copy)).catch(() => {}); } // clone before the page reads the body
      return res;
    } catch (err) {
      const hit = await caches.match(nav ? INDEX : r);
      if (hit) return hit;
      return Response.error();
    }
  })());
});
