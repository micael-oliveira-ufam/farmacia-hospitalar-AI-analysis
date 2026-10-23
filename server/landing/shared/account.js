/* Barra comum + verificação de conta para os módulos (/guia/ e /estoque/). Uso: <script src="/shared/account.js" data-module="ped|gestao" defer>
   Verifica /api/me; sem rede, aceita a última verificação por até 7 dias (carência offline). */
(function () {
  "use strict";
  var me = document.currentScript, mod = me && me.getAttribute("data-module"), GRACE = 7 * 86400 * 1000, KEY = "fhi_ent";
  var I = {
    home: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/></svg>',
    ped: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><g transform="rotate(-40 12 12)"><rect x="2.5" y="8" width="19" height="8" rx="4"/><path d="M12 8v8"/></g><path d="M19 3.5v4M17 5.5h4"/></svg>',
    gestao: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3.5" width="18" height="4.5" rx="1.2"/><path d="M5 8v11a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19V8"/><path d="M9 17v-3M12 17v-6M15 17v-4"/></svg>',
    user: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c.8-4 3.6-6 7.5-6s6.7 2 7.5 6"/></svg>'
  };
  window.FHI_ICONS = I;
  function css() { var l = document.createElement("link"); l.rel = "stylesheet"; l.href = "/shared/bar.css"; document.head.appendChild(l); return l; }
  function store(v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(KEY) || "null"); if (v === null) localStorage.removeItem(KEY); else localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { return null; } }
  function lock(msg, href, label) {
    var d = document.createElement("div"); d.className = "fhi-lock"; d.innerHTML = "<div><h2>Verificação necessária</h2><p class='muted'>" + msg + "</p>" + (href ? "<a class='btn pri' href='" + href + "'>" + label + "</a>" : "") + "</div>"; document.body.appendChild(d);
  }
  function bar(ent, offline) {
    var p = ent.plan, t = "", cls = "plan ok";
    if (p.status === "trial") { t = "Demonstração: " + p.daysLeft + (p.daysLeft === 1 ? " dia restante" : " dias restantes"); cls = "plan"; }
    else if (p.status === "past_due") { t = "Pagamento pendente"; cls = "plan"; }
    else t = "Assinatura ativa";
    if (offline) t += " · offline";
    var b = document.createElement("header"); b.className = "fhi-bar";
    b.innerHTML = '<div class="in"><a class="nav" href="/" title="Início — escolher módulo">' + I.home + '<span class="t">Início</span></a>' +
      '<a class="nav ped" href="/guia/"' + (mod === "ped" ? ' aria-current="page"' : "") + ' title="PosologiaPED">' + I.ped + '<span class="t">PosologiaPED</span></a>' +
      '<a class="nav gestao" href="/estoque/"' + (mod === "gestao" ? ' aria-current="page"' : "") + ' title="FarmaGestão">' + I.gestao + '<span class="t">FarmaGestão</span></a>' +
      '<span class="sp"></span><a class="' + cls + '" href="' + (p.status === "trial" ? "/assinar" : "/conta") + '">' + t + '</a>' +
      '<a class="nav" href="/conta" title="Minha conta">' + I.user + '<span class="t">Conta</span></a></div>';
    document.body.insertBefore(b, document.body.firstChild);
    document.documentElement.style.setProperty("--bar-h", "49px");
    var fix = function () { var h = b.offsetHeight; if (h > 0 && h < 120) document.documentElement.style.setProperty("--bar-h", h + "px"); };
    if (window.ResizeObserver) new ResizeObserver(fix).observe(b); window.addEventListener("load", fix);
  }
  function ok(ent, offline) { css(); bar(ent, offline); }
  var next = encodeURIComponent(location.pathname + location.search);
  function go(url) { location.replace(url); }
  var ctl = new AbortController(), to = setTimeout(function () { ctl.abort(); }, 5000);
  fetch("/api/me", { credentials: "same-origin", cache: "no-store", signal: ctl.signal }).then(function (r) {
    clearTimeout(to);
    if (r.status === 401) { store(null); return go("/entrar?next=" + next); }
    return r.json().then(function (j) {
      if (!j.plan.access) { store(null); return go("/assinar"); }
      store({ at: Date.now(), plan: j.plan, user: j.user }); ok(j, false);
    });
  }).catch(function () {
    clearTimeout(to);
    var c = store(), now = Date.now();
    var valid = c && now - c.at < GRACE && (c.plan.status === "trial" ? now / 1000 < c.plan.trialEndsAt : true);
    if (valid) { css(); ok({ plan: c.plan, user: c.user }, true); }
    else { css(); lock("Sem conexão e a última verificação da conta passou de 7 dias. Conecte-se à internet para continuar.", "/entrar?next=" + next, "Entrar"); }
  });
})();
