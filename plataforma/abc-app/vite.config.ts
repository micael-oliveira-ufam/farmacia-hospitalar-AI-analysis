import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';

/** Gera sw.js com a lista de arquivos do build (pré-cache) para o app funcionar sem internet. */
function offlineSw(): Plugin {
  let base = '/';
  return {
    name: 'offline-sw',
    apply: 'build',
    configResolved(c) { base = c.base; },
    generateBundle(_o, bundle) {
      const files = Object.keys(bundle).filter(f => !f.endsWith('.map'));
      const list = ['./', 'index.html', 'manifest.json', 'icon.svg', 'icon-gestao.svg', 'data/catalog.json', 'data/codajas.json', ...files];
      const version = Date.now().toString(36);
      this.emitFile({ type: 'asset', fileName: 'sw.js', source: `const V='abc-${version}';
const FILES=${JSON.stringify([...new Set(list)])};
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin||u.pathname.startsWith('/api/'))return;
if(u.pathname.startsWith('/shared/')||u.pathname.startsWith('/icons/')){e.respondWith(fetch(r).then(x=>{if(x.ok){const c=x.clone();caches.open(V).then(h=>h.put(r,c))}return x}).catch(()=>caches.match(r)));return}
e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>m||fetch(r).then(x=>{if(x.ok){const c=x.clone();caches.open(V).then(h=>h.put(r,c))}return x}).catch(()=>r.mode==='navigate'?caches.match('index.html'):Response.error())))});
` });
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), offlineSw()],
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  server: { proxy: { '/guia': 'http://localhost:8080' } },
});
