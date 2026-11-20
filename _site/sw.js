// Página inicial offline (GitHub Pages). /guia/ e /estoque/ têm service workers próprios.
const V = 'fhi-pages-home-1';
const OWN = ['./', 'index.html', 'manifest.json', 'icon.svg', 'icons/ped.svg', 'icons/gestao.svg', 'shared/ui.css'];
self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => c.addAll(OWN)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x.startsWith('fhi-pages-home-') && x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url), base = new URL('./', self.location).pathname;
  const rel = u.pathname.slice(base.length);
  if (r.method !== 'GET' || u.origin !== location.origin || !(rel === '' || OWN.includes(rel))) return;
  e.respondWith(fetch(r).then(x => { if (x.ok) { const c = x.clone(); caches.open(V).then(h => h.put(r, c)); } return x; }).catch(() => caches.match(r, { ignoreSearch: true })));
});
