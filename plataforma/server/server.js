// Servidor único: página inicial (/), guia de doses (/guia/) e app de estoque ABC (/estoque/). Sem serviços de IA pagos.
import express from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { openDb } from './db.js';
import { TRIAL_DAYS, hashPassword, checkPassword, loadSecret, signToken, readToken, parseCookies, limiter, validEmail } from './auth.js';
import { PRICE, planOf, stripeClient, verifyWebhook } from './billing.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp(env = process.env) {
  const cfg = {
    publicDir: env.PUBLIC_DIR || path.join(__dirname, 'public'),
    sitePassword: env.SITE_PASSWORD || '',
    dataDir: env.DATA_DIR || path.join(__dirname, 'data'),
    authRequired: (env.AUTH_REQUIRED ?? '1') !== '0',
    publicUrl: (env.PUBLIC_URL || '').replace(/\/$/, ''),
    webhookSecret: env.STRIPE_WEBHOOK_SECRET || '',
  };
  const db = openDb(cfg.dataDir);
  const secret = loadSecret(env, cfg.dataDir);
  const stripe = stripeClient(env);
  const nowS = () => Math.floor(Date.now() / 1000);
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', true);

  const safeEq = (a, b) => {
    const ha = crypto.createHash('sha256').update(String(a)).digest();
    const hb = crypto.createHash('sha256').update(String(b)).digest();
    return crypto.timingSafeEqual(ha, hb);
  };

  app.use((req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'no-referrer',
      'X-Frame-Options': 'SAMEORIGIN',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    });
    next();
  });

  app.get('/healthz', (_req, res) => res.json({ ok: true }));

  // Senha opcional para o site inteiro (HTTP Basic; usuário livre).
  if (cfg.sitePassword) {
    app.use((req, res, next) => {
      if (req.path === '/healthz' || req.path === '/api/billing/webhook') return next();
      const h = req.headers.authorization || '';
      if (h.startsWith('Bearer ') && req.path.startsWith('/api/')) return next(); // app Android usa token da conta
      if (h.startsWith('Basic ')) {
        const pass = Buffer.from(h.slice(6), 'base64').toString().split(':').slice(1).join(':');
        if (safeEq(pass, cfg.sitePassword)) return next();
      }
      res.set('WWW-Authenticate', 'Basic realm="Farmacia Hospitalar Integrada", charset="UTF-8"').status(401).send('Autenticação necessária.');
    });
  }


  // ---------------- contas e assinatura ----------------
  const jsonBody = express.json({ limit: '10kb' });
  const needJson = (req, res, next) => (req.is('application/json') ? next() : res.status(415).json({ error: 'Envie JSON.' }));
  const origin = req => cfg.publicUrl || `${req.protocol}://${req.get('host')}`;
  const publicUser = u => ({ nome: u.nome, email: u.email });
  const getUser = req => {
    const h = req.headers.authorization || '';
    const tok = h.startsWith('Bearer ') ? h.slice(7) : parseCookies(req.headers.cookie).fhi_session;
    const uid = readToken(secret, tok);
    return uid ? db.prepare('SELECT * FROM users WHERE id=?').get(uid) : null;
  };
  const setCookie = (req, res, uid) => res.append('Set-Cookie', `fhi_session=${signToken(secret, uid, 30 * 86400)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 86400}${req.secure ? '; Secure' : ''}`);
  const applySub = (userId, s) => {
    const cpe = s.current_period_end ?? s.items?.data?.[0]?.current_period_end ?? null;
    db.prepare('UPDATE users SET sub_status=?, current_period_end=?, cancel_at_period_end=?, stripe_customer=COALESCE(?,stripe_customer), stripe_sub=?, synced_at=? WHERE id=?')
      .run(s.status, cpe, s.cancel_at_period_end ? 1 : 0, typeof s.customer === 'string' ? s.customer : null, s.id, nowS(), userId);
  };
  const syncSub = async u => {
    if (!u.stripe_sub || !stripe.enabled) return u;
    try { applySub(u.id, await stripe.call('GET', `/subscriptions/${u.stripe_sub}`)); } catch { /* mantém o estado salvo */ }
    return db.prepare('SELECT * FROM users WHERE id=?').get(u.id);
  };
  // Checkout iniciado mas ainda não ligado à conta (ex.: pagou no navegador do celular): resolve consultando a sessão no Stripe.
  const resolvePending = async u => {
    if (u.stripe_sub || !u.checkout_session || !stripe.enabled || nowS() - u.synced_at < 5) return u;
    db.prepare('UPDATE users SET synced_at=? WHERE id=?').run(nowS(), u.id);
    try {
      const s = await stripe.call('GET', `/checkout/sessions/${encodeURIComponent(u.checkout_session)}`);
      if (String(s.client_reference_id) === String(u.id) && s.subscription) {
        db.prepare('UPDATE users SET stripe_customer=?, stripe_sub=? WHERE id=?').run(s.customer, typeof s.subscription === 'string' ? s.subscription : s.subscription.id, u.id);
        return await syncSub(db.prepare('SELECT * FROM users WHERE id=?').get(u.id));
      }
    } catch { /* tenta de novo depois */ }
    return db.prepare('SELECT * FROM users WHERE id=?').get(u.id);
  };
  const meBody = u => ({ user: publicUser(u), plan: planOf(u), price: { amountCents: PRICE.amountCents, currency: 'BRL', label: PRICE.label }, trialDays: TRIAL_DAYS, serverTime: nowS(), paymentsEnabled: stripe.enabled });

  // Webhook do Stripe (corpo bruto para conferir a assinatura). Opcional: sem ele a situação é sincronizada ao voltar do pagamento e a cada acesso.
  app.post('/api/billing/webhook', express.raw({ type: '*/*', limit: '1mb' }), async (req, res) => {
    const raw = req.body?.toString('utf8') || '';
    if (!verifyWebhook(raw, req.headers['stripe-signature'], cfg.webhookSecret)) return res.status(400).json({ error: 'Assinatura inválida.' });
    let ev; try { ev = JSON.parse(raw); } catch { return res.status(400).json({ error: 'JSON inválido.' }); }
    if (db.prepare('SELECT 1 FROM events WHERE id=?').get(ev.id)) return res.json({ received: true, duplicate: true });
    db.prepare('INSERT INTO events(id,at) VALUES(?,?)').run(ev.id, nowS());
    const o = ev.data?.object || {};
    try {
      if (ev.type === 'checkout.session.completed' && o.client_reference_id && o.subscription) {
        db.prepare('UPDATE users SET stripe_customer=?, stripe_sub=? WHERE id=?').run(o.customer, o.subscription, Number(o.client_reference_id));
        await syncSub(db.prepare('SELECT * FROM users WHERE id=?').get(Number(o.client_reference_id)));
      } else if (ev.type.startsWith('customer.subscription.')) {
        const u = db.prepare('SELECT * FROM users WHERE stripe_customer=? OR id=?').get(o.customer, Number(o.metadata?.user_id) || -1);
        if (u) applySub(u.id, o);
      } else if (ev.type === 'invoice.payment_failed' || ev.type === 'invoice.paid') {
        const u = db.prepare('SELECT * FROM users WHERE stripe_customer=?').get(o.customer);
        if (u) await syncSub(u);
      }
    } catch (e) { console.error('webhook:', e.message); }
    res.json({ received: true });
  });

  const tooMany = limiter(10, 15 * 60);
  app.post('/api/auth/register', jsonBody, needJson, async (req, res) => {
    const { nome, email, senha, aceite } = req.body || {};
    const em = String(email || '').trim().toLowerCase();
    if (!tooMany('reg:' + req.ip)) return res.status(429).json({ error: 'Muitas tentativas. Aguarde alguns minutos.' });
    if (typeof nome !== 'string' || nome.trim().length < 2 || nome.length > 80) return res.status(400).json({ error: 'Informe seu nome.' });
    if (!validEmail(em)) return res.status(400).json({ error: 'E-mail inválido.' });
    if (typeof senha !== 'string' || senha.length < 8 || senha.length > 200) return res.status(400).json({ error: 'A senha precisa ter pelo menos 8 caracteres.' });
    if (aceite !== true) return res.status(400).json({ error: 'É necessário aceitar os termos e a política de privacidade.' });
    if (db.prepare('SELECT 1 FROM users WHERE email=?').get(em)) return res.status(409).json({ error: 'Este e-mail já está cadastrado. Entre na sua conta.' });
    const t = nowS();
    const r = db.prepare('INSERT INTO users(email,nome,pass_hash,created_at,trial_ends_at) VALUES(?,?,?,?,?)').run(em, nome.trim(), await hashPassword(senha), t, t + TRIAL_DAYS * 86400);
    const u = db.prepare('SELECT * FROM users WHERE id=?').get(Number(r.lastInsertRowid));
    setCookie(req, res, u.id);
    res.status(201).json({ ...meBody(u), token: req.body.client === 'app' ? signToken(secret, u.id, 30 * 86400) : undefined });
  });
  app.post('/api/auth/login', jsonBody, needJson, async (req, res) => {
    const { email, senha } = req.body || {};
    const em = String(email || '').trim().toLowerCase();
    if (!tooMany('login:' + req.ip + em)) return res.status(429).json({ error: 'Muitas tentativas. Aguarde alguns minutos.' });
    const u = db.prepare('SELECT * FROM users WHERE email=?').get(em);
    const ok = u ? await checkPassword(String(senha || ''), u.pass_hash) : (await checkPassword('x', 's1$AAAAAAAAAAAAAAAAAAAAAA==$AA=='), false);
    if (!ok) return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    setCookie(req, res, u.id);
    const fresh = await resolvePending(await syncSub(u));
    res.json({ ...meBody(fresh), token: req.body.client === 'app' ? signToken(secret, u.id, 30 * 86400) : undefined });
  });
  app.post('/api/auth/logout', (req, res) => { res.append('Set-Cookie', 'fhi_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0'); res.json({ ok: true }); });
  app.get('/api/me', async (req, res) => {
    res.set('Cache-Control', 'no-store');
    let u = getUser(req);
    if (!u) return res.status(401).json({ error: 'Não autenticado.' });
    if (u.stripe_sub && nowS() - u.synced_at > 900) u = await syncSub(u);
    u = await resolvePending(u);
    res.json(meBody(u));
  });
  app.post('/api/billing/checkout', jsonBody, needJson, async (req, res) => {
    const u = getUser(req);
    if (!u) return res.status(401).json({ error: 'Não autenticado.' });
    if (planOf(u).status === 'active') return res.status(409).json({ error: 'Você já tem uma assinatura ativa.' });
    try {
      const o = origin(req);
      const s = await stripe.call('POST', '/checkout/sessions', {
        mode: 'subscription', client_reference_id: u.id, locale: 'pt-BR', payment_method_types: { 0: 'card' },
        ...(u.stripe_customer ? { customer: u.stripe_customer } : { customer_email: u.email }),
        line_items: { 0: { quantity: 1, price_data: { currency: PRICE.currency, unit_amount: PRICE.amountCents, recurring: { interval: 'month' }, product_data: { name: PRICE.name } } } },
        subscription_data: { metadata: { user_id: u.id } },
        success_url: `${o}/api/billing/return?session_id={CHECKOUT_SESSION_ID}`, cancel_url: `${o}/assinar?cancelado=1`,
      });
      db.prepare('UPDATE users SET checkout_session=? WHERE id=?').run(s.id, u.id);
      res.json({ url: s.url });
    } catch (e) { res.status(e.status || 500).json({ error: e.message }); }
  });
  app.get('/api/billing/return', async (req, res) => {
    const u = getUser(req);
    if (!u) return res.redirect(302, '/entrar?next=/conta'); // pagou em outro navegador (app): a conta é resolvida pelo /api/me
    try {
      const s = await stripe.call('GET', `/checkout/sessions/${encodeURIComponent(String(req.query.session_id || ''))}`);
      if (String(s.client_reference_id) !== String(u.id) || !s.subscription) return res.redirect(302, '/assinar?erro=1');
      db.prepare('UPDATE users SET stripe_customer=?, stripe_sub=? WHERE id=?').run(s.customer, typeof s.subscription === 'string' ? s.subscription : s.subscription.id, u.id);
      await syncSub(db.prepare('SELECT * FROM users WHERE id=?').get(u.id));
      res.redirect(302, '/conta?assinatura=ok');
    } catch { res.redirect(302, '/assinar?erro=1'); }
  });
  app.post('/api/billing/portal', jsonBody, needJson, async (req, res) => {
    const u = getUser(req);
    if (!u) return res.status(401).json({ error: 'Não autenticado.' });
    if (!u.stripe_customer) return res.status(409).json({ error: 'Você ainda não tem assinatura.' });
    try { res.json({ url: (await stripe.call('POST', '/billing_portal/sessions', { customer: u.stripe_customer, return_url: origin(req) + '/conta' })).url }); }
    catch (e) { res.status(e.status || 500).json({ error: e.message }); }
  });
  app.post('/api/account/delete', jsonBody, needJson, async (req, res) => {
    const u = getUser(req);
    if (!u) return res.status(401).json({ error: 'Não autenticado.' });
    if (!(await checkPassword(String(req.body?.senha || ''), u.pass_hash))) return res.status(401).json({ error: 'Senha incorreta.' });
    if (planOf(u).status === 'active') return res.status(409).json({ error: 'Cancele a assinatura em “Gerenciar assinatura” antes de excluir a conta.' });
    db.prepare('DELETE FROM users WHERE id=?').run(u.id);
    res.append('Set-Cookie', 'fhi_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
    res.json({ ok: true });
  });
  app.use('/api', (_req, res) => res.status(404).json({ error: 'Não encontrado.' }));

  // Acesso aos módulos: só com teste vigente ou assinatura ativa.
  const gate = (req, res, next) => {
    if (!cfg.authRequired) return next();
    const u = getUser(req);
    const nav = req.headers['sec-fetch-mode'] === 'navigate' || /text\/html/.test(req.headers.accept || '');
    if (!u) return nav ? res.redirect(302, '/entrar?next=' + encodeURIComponent(req.originalUrl)) : res.status(401).json({ error: 'Não autenticado.' });
    if (!planOf(u).access) return nav ? res.redirect(302, '/assinar') : res.status(402).json({ error: 'Assinatura necessária.' });
    next();
  };

  // ---- arquivos estáticos ----
  const guia = path.join(cfg.publicDir, 'guia');
  const abc = path.join(cfg.publicDir, 'abc');
  const landing = path.join(cfg.publicDir, 'landing');
  app.use('/guia', gate, express.static(guia, { extensions: ['html'], setHeaders: (res, p) => { if (p.endsWith('sw.js')) res.set('Cache-Control', 'no-cache'); } }));
  app.use((req, res, next) => (req.path === '/estoque' ? res.redirect(301, '/estoque/') : next()));
  const noCacheSw = (res, p) => { if (p.endsWith('sw.js')) res.set('Cache-Control', 'no-cache'); };
  app.use('/estoque', gate, express.static(abc, { index: 'index.html', maxAge: '1h', setHeaders: noCacheSw }));
  app.get('/estoque/*', gate, (_req, res) => {            // fallback do app de página única
    const f = path.join(abc, 'index.html');
    fs.existsSync(f) ? res.sendFile(f) : res.status(404).send('Aplicativo não compilado.');
  });
  app.use(express.static(landing, { index: 'index.html', extensions: ['html'], maxAge: '5m', setHeaders: noCacheSw }));
  app.get('*', (_req, res) => res.redirect(302, '/'));
  app.locals.db = db;
  return app;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  // Usa PORT; se estiver ocupada, tenta a próxima porta livre (até 50 tentativas). PORT=0 = qualquer porta livre.
  const app = createApp();
  if ((process.env.AUTH_REQUIRED ?? '1') !== '0' && !process.env.STRIPE_SECRET_KEY) console.warn('AVISO: STRIPE_SECRET_KEY ausente; cadastro e 7 dias de demonstração funcionam, mas a assinatura paga ficará indisponível.');
  const start = Number(process.env.PORT || 8080);
  const tryListen = (port, left) => {
    const srv = app.listen(port, '0.0.0.0', () => {
      const real = srv.address().port;
      console.log(`Servidor em http://0.0.0.0:${real}  (início em /, guia em /guia/, estoque em /estoque/)`);
    });
    srv.on('error', e => {
      if (e.code === 'EADDRINUSE' && left > 0 && port !== 0) { console.warn(`Porta ${port} ocupada; tentando ${port + 1}...`); tryListen(port + 1, left - 1); }
      else { console.error(e.message); process.exit(1); }
    });
  };
  tryListen(start, 50);
}
