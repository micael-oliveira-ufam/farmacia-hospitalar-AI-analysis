/* Páginas públicas (início, entrar, assinar, conta): barra com ícones dos módulos e estado da conta. */
(function () {
  "use strict";
  var I = {
    home: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/></svg>',
    ped: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><g transform="rotate(-40 12 12)"><rect x="2.5" y="8" width="19" height="8" rx="4"/><path d="M12 8v8"/></g><path d="M19 3.5v4M17 5.5h4"/></svg>',
    gestao: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3.5" width="18" height="4.5" rx="1.2"/><path d="M5 8v11a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19V8"/><path d="M9 17v-3M12 17v-6M15 17v-4"/></svg>',
    user: '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.6"/><path d="M4.5 20c.8-4 3.6-6 7.5-6s6.7 2 7.5 6"/></svg>'
  };
  var here = location.pathname.replace(/\/$/, "") || "/";
  function bar(me) {
    var b = document.createElement("header"); b.className = "fhi-bar";
    var cur = function (p) { return here === p ? ' aria-current="page"' : ""; };
    b.innerHTML = '<div class="in"><a class="nav" href="/"' + cur("/") + ' title="Início">' + I.home + '<span class="t">Início</span></a>' +
      '<a class="nav ped" href="/guia/" title="PosologiaPED">' + I.ped + '<span class="t">PosologiaPED</span></a>' +
      '<a class="nav gestao" href="/estoque/" title="FarmaGestão">' + I.gestao + '<span class="t">FarmaGestão</span></a><span class="sp"></span>' +
      (me ? '<a class="nav" href="/conta"' + cur("/conta") + ' title="Minha conta">' + I.user + '<span class="t">' + (me.user.nome.split(" ")[0]) + '</span></a>'
          : '<a class="nav" href="/entrar"' + cur("/entrar") + '>' + I.user + '<span class="t">Entrar</span></a>') + '</div>';
    document.body.insertBefore(b, document.body.firstChild);
  }
  window.FHI = {
    icons: I,
    me: fetch("/api/me", { credentials: "same-origin", cache: "no-store" }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
    api: function (path, body) {
      return fetch(path, { method: "POST", credentials: "same-origin", headers: { "content-type": "application/json" }, body: JSON.stringify(body || {}) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) throw new Error(j.error || "Erro inesperado."); return j; }); });
    },
    safeNext: function () { var n = new URLSearchParams(location.search).get("next") || "/"; return /^\/(?!\/)/.test(n) ? n : "/"; }
  };
  window.FHI.me.then(bar);
})();
