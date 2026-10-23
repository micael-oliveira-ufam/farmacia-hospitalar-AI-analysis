// Contas: cadastro com 7 dias de demonstração, login, sessão por cookie assinado (ou Bearer para o app Android).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const TRIAL_DAYS = 7;
const scrypt = (pw, salt) => new Promise((res, rej) => crypto.scrypt(pw, salt, 64, { N: 16384, r: 8, p: 1 }, (e, k) => (e ? rej(e) : res(k))));

export async function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  return `s1$${salt.toString('base64')}$${(await scrypt(pw, salt)).toString('base64')}`;
}
export async function checkPassword(pw, stored) {
  const [v, s, h] = String(stored).split('$');
  if (v !== 's1') return false;
  const got = await scrypt(pw, Buffer.from(s, 'base64'));
  const want = Buffer.from(h, 'base64');
  return got.length === want.length && crypto.timingSafeEqual(got, want);
}

export function loadSecret(env, dataDir) {
  if (env.SESSION_SECRET) return env.SESSION_SECRET;
  if (dataDir === ':memory:') return crypto.randomBytes(32).toString('hex');
  const f = path.join(dataDir, 'session.key');
  try { return fs.readFileSync(f, 'utf8').trim(); } catch { /* cria */ }
  const k = crypto.randomBytes(32).toString('hex');
  fs.writeFileSync(f, k, { mode: 0o600 });
  return k;
}

const b64 = b => Buffer.from(b).toString('base64url');
export function signToken(secret, uid, ttlSec) {
  const body = b64(JSON.stringify({ u: uid, e: Math.floor(Date.now() / 1000) + ttlSec }));
  return `${body}.${crypto.createHmac('sha256', secret).update(body).digest('base64url')}`;
}
export function readToken(secret, tok) {
  if (!tok || typeof tok !== 'string' || !tok.includes('.')) return null;
  const [body, sig] = tok.split('.');
  const want = crypto.createHmac('sha256', secret).update(body).digest('base64url');
  const a = Buffer.from(sig || ''), b = Buffer.from(want);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString());
    return p.e > Date.now() / 1000 ? p.u : null;
  } catch { return null; }
}

export function parseCookies(h = '') {
  const o = {};
  h.split(';').forEach(p => { const i = p.indexOf('='); if (i > 0) o[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim()); });
  return o;
}

/** Limitador simples em memória: máx. `max` tentativas por chave em `windowSec`. */
export function limiter(max, windowSec) {
  const m = new Map();
  return key => {
    const now = Date.now(), e = m.get(key) || { n: 0, t: now };
    if (now - e.t > windowSec * 1000) { e.n = 0; e.t = now; }
    e.n++; m.set(key, e);
    if (m.size > 5000) for (const [k, v] of m) if (now - v.t > windowSec * 1000) m.delete(k);
    return e.n <= max;
  };
}

export const validEmail = e => typeof e === 'string' && e.length <= 120 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
