import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import crypto from 'node:crypto';
import { createApp } from '../server.js';
import { planOf, verifyWebhook } from '../billing.js';

const listen = app => new Promise(r => { const s = app.listen(0, '127.0.0.1', () => r(s)); });
const stop = (...ss) => ss.forEach(x => { x.close(); x.closeAllConnections?.(); });
const base = s => `http://127.0.0.1:${s.address().port}`;
const pub = fs.mkdtempSync(path.join(os.tmpdir(), 'pub-'));
for (const d of ['guia', 'abc', 'landing']) fs.mkdirSync(path.join(pub, d));
fs.writeFileSync(path.join(pub, 'landing', 'index.html'), 'HOME');
fs.writeFileSync(path.join(pub, 'guia', 'index.html'), 'GUIA');
fs.writeFileSync(path.join(pub, 'abc', 'index.html'), 'ABC');

// Stripe falso (só para o teste): registra chamadas e devolve respostas fixas.
function fakeStripe() {
  const calls = [];
  const srv = http.createServer((req, res) => {
    let b = ''; req.on('data', c => (b += c)); req.on('end', () => {
      calls.push({ method: req.method, url: req.url, body: Object.fromEntries(new URLSearchParams(b)), auth: req.headers.authorization });
      res.setHeader('content-type', 'application/json');
      if (req.url === '/v1/checkout/sessions' && req.method === 'POST') return res.end(JSON.stringify({ id: 'cs_1', url: 'https://checkout.stripe.test/pay/cs_1' }));
      if (req.url.startsWith('/v1/checkout/sessions/')) return res.end(JSON.stringify({ id: 'cs_1', client_reference_id: fakeStripe.uid, customer: 'cus_1', subscription: 'sub_1' }));
      if (req.url === '/v1/subscriptions/sub_1') return res.end(JSON.stringify({ id: 'sub_1', status: fakeStripe.status || 'active', customer: 'cus_1', current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400, cancel_at_period_end: false }));
      if (req.url === '/v1/billing_portal/sessions') return res.end(JSON.stringify({ url: 'https://portal.stripe.test/x' }));
      res.statusCode = 404; res.end('{}');
    });
  });
  return new Promise(r => srv.listen(0, '127.0.0.1', () => r({ srv, calls, url: `http://127.0.0.1:${srv.address().port}` })));
}

const post = (s, p, body, cookie, extra = {}) => fetch(base(s) + p, { method: 'POST', redirect: 'manual', headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}), ...extra }, body: JSON.stringify(body) });
const cookieOf = r => (r.headers.get('set-cookie') || '').split(';')[0];

test('planOf: demonstração de 7 dias, expiração e assinatura', () => {
  const t = 1_000_000, u = { trial_ends_at: t + 7 * 86400 };
  assert.equal(planOf(u, t).status, 'trial'); assert.equal(planOf(u, t).daysLeft, 7);
  assert.equal(planOf(u, t + 6.5 * 86400).daysLeft, 1);
  assert.deepEqual([planOf(u, t + 7 * 86400).status, planOf(u, t + 7 * 86400).access], ['expired', false]);
  assert.equal(planOf({ ...u, sub_status: 'active', current_period_end: t }, t + 99 * 86400).access, true);
  assert.equal(planOf({ ...u, sub_status: 'canceled' }, t + 99 * 86400).access, false);
  assert.equal(planOf({ ...u, sub_status: 'past_due', current_period_end: t + 10 * 86400 }, t + 11 * 86400).access, true);
  assert.equal(planOf({ ...u, sub_status: 'past_due', current_period_end: t + 10 * 86400 }, t + 20 * 86400).access, false);
});

test('verifyWebhook confere HMAC e tolerância', () => {
  const raw = '{"id":"evt_1"}', t = 5000, sec = 'whsec_x';
  const sig = crypto.createHmac('sha256', sec).update(`${t}.${raw}`).digest('hex');
  assert.equal(verifyWebhook(raw, `t=${t},v1=${sig}`, sec, t + 10), true);
  assert.equal(verifyWebhook(raw, `t=${t},v1=${sig}`, 'outro', t + 10), false);
  assert.equal(verifyWebhook(raw + ' ', `t=${t},v1=${sig}`, sec, t + 10), false);
  assert.equal(verifyWebhook(raw, `t=${t},v1=${sig}`, sec, t + 1000), false);
});

test('cadastro → demonstração libera módulos; sem login é redirecionado', async () => {
  const s = await listen(createApp({ DATA_DIR: ':memory:', PUBLIC_DIR: pub }));
  let r = await fetch(base(s) + '/guia/', { redirect: 'manual', headers: { accept: 'text/html' } });
  assert.equal(r.status, 302); assert.match(r.headers.get('location'), /^\/entrar\?next=/);
  assert.equal((await fetch(base(s) + '/estoque/', { headers: { accept: 'application/json' } })).status, 401);
  assert.equal(await (await fetch(base(s) + '/')).text(), 'HOME'); // página de escolha é pública
  r = await post(s, '/api/auth/register', { nome: 'Ana', email: 'ana@exemplo.com', senha: 'curta', aceite: true });
  assert.equal(r.status, 400);
  r = await post(s, '/api/auth/register', { nome: 'Ana', email: 'ana@exemplo.com', senha: 'senha-segura', aceite: false });
  assert.equal(r.status, 400);
  r = await post(s, '/api/auth/register', { nome: 'Ana', email: 'Ana@Exemplo.com', senha: 'senha-segura', aceite: true });
  assert.equal(r.status, 201);
  const j = await r.json(); const ck = cookieOf(r);
  assert.match(r.headers.get('set-cookie'), /HttpOnly/); assert.match(r.headers.get('set-cookie'), /SameSite=Lax/);
  assert.equal(j.plan.status, 'trial'); assert.equal(j.plan.daysLeft, 7); assert.equal(j.price.amountCents, 2999);
  assert.equal((await post(s, '/api/auth/register', { nome: 'Ana', email: 'ana@exemplo.com', senha: 'senha-segura', aceite: true })).status, 409);
  assert.equal(await (await fetch(base(s) + '/guia/', { headers: { cookie: ck } })).text(), 'GUIA');
  assert.equal(await (await fetch(base(s) + '/estoque/', { headers: { cookie: ck } })).text(), 'ABC');
  assert.equal((await fetch(base(s) + '/guia/', { headers: { cookie: 'fhi_session=forjado.x', accept: 'text/html' }, redirect: 'manual' })).status, 302);
  // senha não fica em texto puro
  stop(s);
});

test('demonstração vencida bloqueia (402/redirect para /assinar); login e logout', async () => {
  const app = createApp({ DATA_DIR: ':memory:', PUBLIC_DIR: pub }); const s = await listen(app);
  let r = await post(s, '/api/auth/register', { nome: 'Bia', email: 'bia@exemplo.com', senha: 'senha-segura', aceite: true });
  const ck = cookieOf(r);
  const stored = app.locals.db.prepare('SELECT pass_hash FROM users').get().pass_hash;
  assert.ok(stored.startsWith('s1$') && !stored.includes('senha-segura'));
  app.locals.db.prepare('UPDATE users SET trial_ends_at = ?').run(Math.floor(Date.now() / 1000) - 10);
  r = await fetch(base(s) + '/guia/', { headers: { cookie: ck, accept: 'text/html' }, redirect: 'manual' });
  assert.equal(r.status, 302); assert.equal(r.headers.get('location'), '/assinar');
  assert.equal((await fetch(base(s) + '/guia/x.js', { headers: { cookie: ck } })).status, 402);
  assert.equal((await (await fetch(base(s) + '/api/me', { headers: { cookie: ck } })).json()).plan.status, 'expired');
  assert.equal((await post(s, '/api/auth/login', { email: 'bia@exemplo.com', senha: 'errada-errada' })).status, 401);
  r = await post(s, '/api/auth/login', { email: 'bia@exemplo.com', senha: 'senha-segura', client: 'app' });
  const j = await r.json(); assert.equal(r.status, 200); assert.ok(j.token);
  assert.equal((await fetch(base(s) + '/api/me', { headers: { authorization: 'Bearer ' + j.token } })).status, 200);
  assert.equal((await fetch(base(s) + '/api/me', { headers: { authorization: 'Bearer ' + j.token + 'x' } })).status, 401);
  assert.equal((await post(s, '/api/auth/login', { email: 'a@b.co', senha: 'x' }, null, { 'content-type': 'text/plain' })).status, 415);
  stop(s);
});

test('assinatura: checkout hospedado (cartão fica no Stripe), retorno, portal e acesso', async () => {
  const f = await fakeStripe();
  const app = createApp({ DATA_DIR: ':memory:', PUBLIC_DIR: pub, STRIPE_SECRET_KEY: 'sk_test_x', STRIPE_API_BASE: f.url, PUBLIC_URL: 'https://site.exemplo' });
  const s = await listen(app);
  let r = await post(s, '/api/auth/register', { nome: 'Caio', email: 'caio@exemplo.com', senha: 'senha-segura', aceite: true });
  const ck = cookieOf(r), uid = app.locals.db.prepare('SELECT id FROM users').get().id; fakeStripe.uid = String(uid);
  app.locals.db.prepare('UPDATE users SET trial_ends_at = ?').run(Math.floor(Date.now() / 1000) - 10);
  r = await post(s, '/api/billing/checkout', {}, ck);
  assert.equal((await r.json()).url, 'https://checkout.stripe.test/pay/cs_1');
  const c = f.calls.find(x => x.url === '/v1/checkout/sessions' && x.method === 'POST');
  assert.equal(c.auth, 'Bearer sk_test_x');
  assert.equal(c.body['mode'], 'subscription'); assert.equal(c.body['line_items[0][price_data][unit_amount]'], '2999');
  assert.equal(c.body['line_items[0][price_data][currency]'], 'brl'); assert.equal(c.body['line_items[0][price_data][recurring][interval]'], 'month');
  assert.equal(c.body['client_reference_id'], String(uid)); assert.equal(c.body['customer_email'], 'caio@exemplo.com');
  assert.match(c.body['success_url'], /^https:\/\/site\.exemplo\/api\/billing\/return\?session_id=/);
  assert.ok(!JSON.stringify(c.body).match(/card\[number\]|cvc/i)); // nenhum dado de cartão trafega por aqui
  r = await fetch(base(s) + '/api/billing/return?session_id=cs_1', { headers: { cookie: ck }, redirect: 'manual' });
  assert.equal(r.headers.get('location'), '/conta?assinatura=ok');
  const me = await (await fetch(base(s) + '/api/me', { headers: { cookie: ck } })).json();
  assert.equal(me.plan.status, 'active'); assert.equal(me.plan.access, true);
  assert.equal(await (await fetch(base(s) + '/guia/', { headers: { cookie: ck } })).text(), 'GUIA');
  assert.equal((await post(s, '/api/billing/checkout', {}, ck)).status, 409);
  assert.equal((await (await post(s, '/api/billing/portal', {}, ck)).json()).url, 'https://portal.stripe.test/x');
  assert.equal((await post(s, '/api/account/delete', { senha: 'senha-segura' }, ck)).status, 409);
  stop(s, f.srv);
});

test('pagamento feito em outro navegador (app Android) é reconhecido pelo /api/me', async () => {
  const f = await fakeStripe();
  const app = createApp({ DATA_DIR: ':memory:', PUBLIC_DIR: pub, STRIPE_SECRET_KEY: 'sk_test_x', STRIPE_API_BASE: f.url });
  const s = await listen(app);
  const r = await post(s, '/api/auth/register', { nome: 'Fabi', email: 'fabi@exemplo.com', senha: 'senha-segura', aceite: true, client: 'app' });
  const { token } = await r.json(); const auth = { authorization: 'Bearer ' + token };
  fakeStripe.uid = String(app.locals.db.prepare('SELECT id FROM users').get().id);
  app.locals.db.prepare('UPDATE users SET trial_ends_at = 1').run();
  assert.equal((await (await fetch(base(s) + '/api/me', { headers: auth })).json()).plan.access, false);
  assert.equal((await (await fetch(base(s) + '/api/billing/checkout', { method: 'POST', headers: { ...auth, 'content-type': 'application/json' }, body: '{}' })).json()).url.includes('checkout.stripe.test'), true);
  app.locals.db.prepare('UPDATE users SET synced_at = 0').run();
  assert.equal((await (await fetch(base(s) + '/api/me', { headers: auth })).json()).plan.status, 'active');
  stop(s, f.srv);
});

test('webhook: assinatura válida cancela acesso; inválida é recusada; evento repetido é ignorado', async () => {
  const sec = 'whsec_teste';
  const app = createApp({ DATA_DIR: ':memory:', PUBLIC_DIR: pub, STRIPE_WEBHOOK_SECRET: sec }); const s = await listen(app);
  let r = await post(s, '/api/auth/register', { nome: 'Dani', email: 'dani@exemplo.com', senha: 'senha-segura', aceite: true });
  const ck = cookieOf(r);
  app.locals.db.prepare("UPDATE users SET trial_ends_at=?, stripe_customer='cus_9', stripe_sub='sub_9', sub_status='active', current_period_end=?").run(1, Math.floor(Date.now() / 1000) + 86400);
  const ev = JSON.stringify({ id: 'evt_a', type: 'customer.subscription.deleted', data: { object: { id: 'sub_9', customer: 'cus_9', status: 'canceled', current_period_end: 1, cancel_at_period_end: false } } });
  const t = Math.floor(Date.now() / 1000), sig = crypto.createHmac('sha256', sec).update(`${t}.${ev}`).digest('hex');
  const send = (body, h) => fetch(base(s) + '/api/billing/webhook', { method: 'POST', headers: { 'content-type': 'application/json', 'stripe-signature': h }, body });
  assert.equal((await send(ev, `t=${t},v1=deadbeef`)).status, 400);
  assert.equal((await send(ev, `t=${t},v1=${sig}`)).status, 200);
  assert.equal((await (await send(ev, `t=${t},v1=${sig}`)).json()).duplicate, true);
  assert.equal((await (await fetch(base(s) + '/api/me', { headers: { cookie: ck } })).json()).plan.access, false);
  stop(s);
});

test('sem chave do Stripe o checkout responde 503, sem quebrar o resto', async () => {
  const s = await listen(createApp({ DATA_DIR: ':memory:', PUBLIC_DIR: pub }));
  const r = await post(s, '/api/auth/register', { nome: 'Eva', email: 'eva@exemplo.com', senha: 'senha-segura', aceite: true });
  const out = await post(s, '/api/billing/checkout', {}, cookieOf(r));
  assert.equal(out.status, 503); stop(s);
});
