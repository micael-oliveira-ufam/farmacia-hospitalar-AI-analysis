// Servidor único: página inicial (/), guia de doses (/guia/) e app de estoque ABC (/estoque/). Sem serviços de IA pagos.
import express from 'express';
import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function createApp(env = process.env) {
  const cfg = {
    publicDir: env.PUBLIC_DIR || path.join(__dirname, 'public'),
    sitePassword: env.SITE_PASSWORD || '',
  };
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
      if (req.path === '/healthz') return next();
      const h = req.headers.authorization || '';
      if (h.startsWith('Basic ')) {
        const pass = Buffer.from(h.slice(6), 'base64').toString().split(':').slice(1).join(':');
        if (safeEq(pass, cfg.sitePassword)) return next();
      }
      res.set('WWW-Authenticate', 'Basic realm="Farmacia Hospitalar Integrada", charset="UTF-8"').status(401).send('Autenticação necessária.');
    });
  }

  app.use('/api', (_req, res) => res.status(404).json({ error: 'Não encontrado.' }));

  // ---- arquivos estáticos ----
  const guia = path.join(cfg.publicDir, 'guia');
  const abc = path.join(cfg.publicDir, 'abc');
  const landing = path.join(cfg.publicDir, 'landing');
  app.use('/guia', express.static(guia, { extensions: ['html'], setHeaders: (res, p) => { if (p.endsWith('sw.js')) res.set('Cache-Control', 'no-cache'); } }));
  app.use((req, res, next) => (req.path === '/estoque' ? res.redirect(301, '/estoque/') : next()));
  const noCacheSw = (res, p) => { if (p.endsWith('sw.js')) res.set('Cache-Control', 'no-cache'); };
  app.use('/estoque', express.static(abc, { index: 'index.html', maxAge: '1h', setHeaders: noCacheSw }));
  app.get('/estoque/*', (_req, res) => {            // fallback do app de página única
    const f = path.join(abc, 'index.html');
    fs.existsSync(f) ? res.sendFile(f) : res.status(404).send('Aplicativo não compilado.');
  });
  app.use(express.static(landing, { index: 'index.html', maxAge: '5m', setHeaders: noCacheSw }));
  app.get('*', (_req, res) => res.redirect(302, '/'));
  return app;
}

if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
  // Usa PORT; se estiver ocupada, tenta a próxima porta livre (até 50 tentativas). PORT=0 = qualquer porta livre.
  const app = createApp();
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
