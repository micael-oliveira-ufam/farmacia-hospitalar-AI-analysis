const V='abc-mwp8eidc';
const FILES=["./","index.html","manifest.json","icon.svg","icon-gestao.svg","ufam.png","data/catalog.json","data/codajas.json","assets/publicsans-DdeTHZLK.woff2","assets/bricolage-DLoelf7F.woff2","assets/index-BaKrHQw9.css","assets/index-WM7hbxKp.js"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin||u.pathname.startsWith('/api/'))return;
if(u.pathname.startsWith('/shared/')||u.pathname.startsWith('/icons/')){e.respondWith(fetch(r).then(x=>{if(x.ok){const c=x.clone();caches.open(V).then(h=>h.put(r,c))}return x}).catch(()=>caches.match(r)));return}
e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>m||fetch(r).then(x=>{if(x.ok){const c=x.clone();caches.open(V).then(h=>h.put(r,c))}return x}).catch(()=>r.mode==='navigate'?caches.match('index.html'):Response.error())))});
