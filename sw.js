/* Study Checklist service worker: network-first, so you always get the newest version.
   The saved copy is used ONLY when the network request fails (you are offline).
   It never touches Firebase data or sign-in calls (only the app files, Firebase scripts and fonts). */
const CACHE = 'study-checklist-v2';
const HOSTS = ['www.gstatic.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];
const SCOPE = self.registration.scope;
const INDEX = new URL('index.html', SCOPE).href;
const FILES = ['styles.css', 'firebase.js', 'data-im.js', 'data-pd.js', 'data-bb.js', 'state.js', 'list-views.js',
  'core.js', 'planner.js', 'ui.js', 'tools.js', 'nav.js', 'settings-tips.js', 'init.js'].map(f => new URL(f, SCOPE).href);
const PRE = [INDEX, ...FILES,
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap'];

// keep one copy per app file, so a new ?v= never leaves an old copy behind
async function putFresh(c, key, res) {
  const u = new URL(typeof key === 'string' ? key : key.url);
  if (u.origin === location.origin) {
    for (const k of await c.keys()) {
      const ku = new URL(k.url);
      if (ku.pathname === u.pathname && k.url !== u.href) await c.delete(k);
    }
  }
  await c.put(key, res);
}

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
  const nav = r.mode === 'navigate', key = nav ? INDEX : r;
  e.respondWith((async () => {
    try {
      let res = await fetch(same ? r.url : r, same ? { cache: 'no-cache' } : undefined); // revalidate, never a stale HTTP-cached copy
      if (nav && res.redirected) res = new Response(res.body, { status: 200, statusText: 'OK', headers: res.headers });
      if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => putFresh(c, key, copy)).catch(() => {}); }
      return res;
    } catch (err) {
      const hit = await caches.match(key, { ignoreSearch: true });
      return hit || Response.error();
    }
  })());
});
