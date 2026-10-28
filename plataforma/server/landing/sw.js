// Página inicial offline. Só trata os arquivos da própria página inicial; /guia/ e /estoque/ têm seus próprios service workers.
const V = 'icam-home-4';
const OWN = ['/', '/index.html', '/manifest.json', '/icon.svg', '/icons/ped.svg', '/icons/gestao.svg', '/shared/ui.css', '/shared/bar.css', '/shared/site.js', '/shared/account.js'];
self.addEventListener('install', e => e.waitUntil(caches.open(V).then(c => c.addAll(OWN)).then(() => self.skipWaiting())));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x.startsWith('icam-home-') && x !== V).map(x => caches.delete(x)))).then(() => self.clients.claim())));
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin || !OWN.includes(u.pathname)) return;
  e.respondWith(fetch(r).then(x => { if (x.ok) { const c = x.clone(); caches.open(V).then(h => h.put(r, c)); } return x; }).catch(() => caches.match(r, { ignoreSearch: true })));
});
