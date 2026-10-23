// Plano, assinatura e integração com o Stripe (Checkout hospedado + portal do cliente). Sem SDK: chamadas HTTPS diretas.
import crypto from 'node:crypto';

export const PRICE = { amountCents: 2999, currency: 'brl', label: 'R$ 29,99 por mês', name: 'Farmácia Hospitalar Integrada — assinatura mensal' };
const DAY = 86400, PAST_DUE_GRACE = 3 * DAY;

/** Situação de acesso do usuário. Tempo em segundos (epoch). */
export function planOf(u, now = Math.floor(Date.now() / 1000)) {
  const base = { price: PRICE.label, trialEndsAt: u.trial_ends_at };
  if (['active', 'trialing'].includes(u.sub_status))
    return { ...base, status: 'active', access: true, renewsAt: u.current_period_end || null, cancelAtPeriodEnd: !!u.cancel_at_period_end };
  if (u.sub_status === 'past_due' && (u.current_period_end || 0) + PAST_DUE_GRACE > now)
    return { ...base, status: 'past_due', access: true, renewsAt: u.current_period_end || null };
  if (now < u.trial_ends_at)
    return { ...base, status: 'trial', access: true, daysLeft: Math.max(1, Math.ceil((u.trial_ends_at - now) / DAY)) };
  return { ...base, status: u.sub_status ? 'canceled' : 'expired', access: false };
}

const flat = (o, p = '', out = []) => {
  for (const [k, v] of Object.entries(o)) {
    const key = p ? `${p}[${k}]` : k;
    if (v && typeof v === 'object') flat(v, key, out); else if (v !== undefined && v !== null) out.push([key, String(v)]);
  }
  return out;
};

export function stripeClient(env) {
  const key = env.STRIPE_SECRET_KEY, base = (env.STRIPE_API_BASE || 'https://api.stripe.com') + '/v1';
  const enabled = !!key;
  async function call(method, path, params) {
    if (!enabled) throw Object.assign(new Error('Pagamento não configurado no servidor.'), { status: 503 });
    const body = params ? new URLSearchParams(flat(params)) : undefined;
    const r = await fetch(base + path, {
      method,
      headers: { Authorization: `Bearer ${key}`, ...(body ? { 'content-type': 'application/x-www-form-urlencoded' } : {}) },
      body: method === 'GET' ? undefined : body,
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) throw Object.assign(new Error(j?.error?.message || 'Erro no provedor de pagamento.'), { status: 502 });
    return j;
  }
  return { enabled, call };
}

/** Confere a assinatura do webhook (cabeçalho Stripe-Signature) com tolerância de 5 minutos. */
export function verifyWebhook(raw, header, secret, now = Math.floor(Date.now() / 1000)) {
  if (!secret || !header) return false;
  const parts = Object.fromEntries(String(header).split(',').map(p => p.split('=')).filter(p => p.length === 2));
  const t = Number(parts.t);
  if (!t || Math.abs(now - t) > 300) return false;
  const want = crypto.createHmac('sha256', secret).update(`${t}.${raw}`).digest('hex');
  return String(header).split(',').filter(p => p.startsWith('v1=')).some(p => {
    const got = p.slice(3);
    return got.length === want.length && crypto.timingSafeEqual(Buffer.from(got), Buffer.from(want));
  });
}
