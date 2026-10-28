import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../server.js';

const listen = app => new Promise(r => { const s = app.listen(0, '127.0.0.1', () => r(s)); });
const stop = (...ss) => ss.forEach(x => { x.close(); x.closeAllConnections?.(); });
const base = s => `http://127.0.0.1:${s.address().port}`;

const pub = fs.mkdtempSync(path.join(os.tmpdir(), 'pub-'));
fs.mkdirSync(path.join(pub, 'guia')); fs.mkdirSync(path.join(pub, 'abc')); fs.mkdirSync(path.join(pub, 'landing'));
fs.writeFileSync(path.join(pub, 'landing', 'index.html'), 'HOME');
fs.writeFileSync(path.join(pub, 'guia', 'index.html'), 'GUIA');
fs.writeFileSync(path.join(pub, 'abc', 'index.html'), 'ABC');

test('estáticos, SPA fallback e healthz', async () => {
  const s = await listen(createApp({ AUTH_REQUIRED: '0', DATA_DIR: ':memory:', PUBLIC_DIR: pub }));
  assert.equal(await (await fetch(base(s) + '/guia/')).text(), 'GUIA');
  assert.equal(await (await fetch(base(s) + '/')).text(), 'HOME');
  assert.equal(await (await fetch(base(s) + '/estoque/')).text(), 'ABC');
  assert.equal(await (await fetch(base(s) + '/estoque/rota/x')).text(), 'ABC');
  assert.equal(await (await fetch(base(s) + '/qualquer/rota')).text(), 'HOME');
  assert.deepEqual(await (await fetch(base(s) + '/healthz')).json(), { ok: true });
  stop(s);
});

test('rota /api não existe mais (sem IA)', async () => {
  const s = await listen(createApp({ AUTH_REQUIRED: '0', DATA_DIR: ':memory:', PUBLIC_DIR: pub }));
  const r = await fetch(base(s) + '/api/ai/generate', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{"prompt":"x"}' });
  assert.equal(r.status, 404); stop(s);
});

test('senha do site (Basic) protege tudo, exceto healthz', async () => {
  const s = await listen(createApp({ AUTH_REQUIRED: '0', DATA_DIR: ':memory:', PUBLIC_DIR: pub, SITE_PASSWORD: 'senha-forte' }));
  assert.equal((await fetch(base(s) + '/guia/')).status, 401);
  assert.equal((await fetch(base(s) + '/healthz')).status, 200);
  const h = u => ({ headers: { authorization: 'Basic ' + Buffer.from('u:' + u).toString('base64') } });
  assert.equal((await fetch(base(s) + '/guia/', h('errada'))).status, 401);
  assert.equal((await fetch(base(s) + '/guia/', h('senha-forte'))).status, 200);
  stop(s);
});
