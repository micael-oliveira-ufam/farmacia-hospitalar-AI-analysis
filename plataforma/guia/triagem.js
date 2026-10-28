/* Triagem de prescrição (interações, duplicidades, função renal/hepática, faixa etária).
   Lógica própria, inspirada nas categorias de alerta do NoHarm.ai (MIT, https://github.com/noharm-ai); nenhum código ou dado do NoHarm foi copiado.
   Funciona 100% offline. Regras: data/interacoes.json (compiladas por IA; exigem revisão farmacêutica). */
(function (root, factory) { if (typeof module === "object" && module.exports) module.exports = factory(); else root.Triagem = factory(); })(this, function () {
  const norm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const SEV = { 2: "grave", 1: "atenção", 0: "informação" };
  const has = (n, tok) => (" " + n + " ").includes(" " + tok + " ");
  // ingrediente = nome da monografia até o primeiro número ou parêntese
  const ingOf = name => norm(String(name).split(/[\d(]/)[0]).replace(/[^a-z0-9+ ]/g, " ").replace(/\s+/g, " ").trim();
  function expand(spec, groups) { // "@grupo" | "token"
    if (spec == null) return [];
    return spec[0] === "@" ? (groups[spec.slice(1)] || []) : [spec];
  }
  const matchTok = (d, toks) => toks.some(t => has(d.n, t));
  function analyze(drugs, patient, data) {
    patient = patient || {}; data = data || { grupos: {}, regras: [] };
    const age = patient.age || "ped", out = [], seen = new Set(), done = new Set();
    const add = a => { const k = a.tipo + "|" + a.titulo + "|" + a.drugs.map(d => d.id).sort().join(","); if (!seen.has(k)) { seen.add(k); out.push(a); } };
    const list = drugs.map(d => Object.assign({ n: ingOf(d.name) }, d));
    // 1) interações por regra (regras específicas da faixa etária primeiro)
    const rules = data.regras.slice().sort((a, b) => (b.so ? 1 : 0) - (a.so ? 1 : 0));
    for (const r of rules) {
      if (r.so && r.so !== age) continue;
      const A = expand(r.a, data.grupos), B = expand(r.b, data.grupos);
      if (r.min) { // regra de grupo: pelo menos N fármacos do grupo
        const hit = list.filter(d => matchTok(d, A));
        if (hit.length >= r.min) add({ tipo: "interacao", sev: r.sev, titulo: r.titulo, drugs: hit, mec: r.mec, cond: r.cond, ref: r.ref });
        continue;
      }
      for (const x of list) for (const y of list) {
        if (x.id === y.id || !matchTok(x, A) || !matchTok(y, B)) continue;
        const pk = [x.id, y.id].sort().join("-") + "|" + (typeof r.a === "string" ? r.a : "") + (typeof r.b === "string" ? r.b : "");
        const gk = [x.id, y.id].sort().join("-") + "|" + (r.b ? r.b : "") + "|" + r.titulo;
        if (done.has("p:" + [x.id, y.id].sort().join("-") + ":" + r.titulo)) continue;
        // regra geral não repete par já coberto por regra específica de mesmo título
        if (!r.so && done.has("s:" + [x.id, y.id].sort().join("-") + ":" + r.titulo)) continue;
        done.add("p:" + [x.id, y.id].sort().join("-") + ":" + r.titulo);
        if (r.so) done.add("s:" + [x.id, y.id].sort().join("-") + ":" + r.titulo);
        add({ tipo: "interacao", sev: r.sev, titulo: r.titulo, drugs: [x, y], mec: r.mec, cond: r.cond, ref: r.ref });
      }
    }
    // 2) duplicidades
    const byIng = {}, byCls = {};
    for (const d of list) { (byIng[d.n] = byIng[d.n] || []).push(d); (byCls[d.c] = byCls[d.c] || []).push(d); }
    for (const [n, a] of Object.entries(byIng)) if (a.length > 1 && n) add({ tipo: "duplicidade", sev: 2, titulo: "Mesmo princípio ativo em duplicidade", drugs: a, mec: "O mesmo medicamento aparece mais de uma vez (apresentações ou vias diferentes).", cond: "Confirmar se é intencional e somar a dose diária total.", ref: ["LEX"] });
    for (const [c, a] of Object.entries(byCls)) {
      const uniq = new Set(a.map(d => d.n)); if (uniq.size > 1) add({ tipo: "duplicidade", sev: 1, titulo: "Mesma classe/função: " + c, drugs: a, mec: "Possível duplicidade terapêutica.", cond: "Confirmar a intenção clínica (associações podem ser propositais).", ref: ["LEX"] });
    }
    // 3) função renal / hepática do paciente
    const crcl = patient.crcl;
    if (crcl != null && crcl < 60) {
      const hit = list.filter(d => d.nef > 0);
      if (hit.length) add({ tipo: "renal", sev: crcl < 30 || hit.some(d => d.nef === 2) ? 2 : 1, titulo: "Função renal reduzida (ClCr " + crcl + " mL/min)", drugs: hit, mec: hit.map(d => d.name.split(/[\d(,]/)[0].trim() + ": " + d.nefN).join(" • "), cond: "Checar ajuste de dose/intervalo na bula ou em referência renal e monitorar creatinina.", ref: ["NEFRO", "KDIGO"] });
    }
    if (patient.hepatic) {
      const hit = list.filter(d => d.hep > 0);
      if (hit.length) add({ tipo: "hepatica", sev: hit.some(d => d.hep === 2) ? 2 : 1, titulo: "Insuficiência hepática informada", drugs: hit, mec: hit.map(d => d.name.split(/[\d(,]/)[0].trim() + ": " + d.hepN).join(" • "), cond: "Checar ajuste de dose, preferir alternativa sem metabolização hepática relevante e monitorar enzimas.", ref: ["LTOX"] });
    }
    // 4) toxicidades somadas
    const nef = list.filter(d => d.nef === 2);
    if (nef.length >= 2) add({ tipo: "soma", sev: 2, titulo: "Vários fármacos nefrotóxicos", drugs: nef, mec: "Nefrotoxicidade somada.", cond: "Verificar função renal, hidratação e a necessidade de cada item.", ref: ["NEFRO", "KDIGO"] });
    const hep = list.filter(d => d.hep === 2);
    if (hep.length >= 2) add({ tipo: "soma", sev: 1, titulo: "Vários fármacos hepatotóxicos", drugs: hep, mec: "Hepatotoxicidade somada.", cond: "Verificar função hepática e o uso de cada item.", ref: ["LTOX"] });
    // 5) faixa etária
    if (age === "neo" || age === "ped") for (const d of list) if (d.pa) add({ tipo: "faixa", sev: age === "neo" && /contraindic|evitar|n[aã]o usar/i.test(d.pa) ? 2 : 1, titulo: "Alerta pediátrico: " + d.name.split(/[\d(,]/)[0].trim(), drugs: [d], mec: d.pa, cond: "Conferir indicação, dose por peso e faixa etária.", ref: ["LEX", "BNFC"] });
    // 6) informação: alta vigilância e controlados
    const mav = list.filter(d => d.ismp);
    if (mav.length) add({ tipo: "info", sev: 0, titulo: "Alta vigilância (ISMP Brasil)", drugs: mav, mec: "Medicamentos potencialmente perigosos de uso hospitalar.", cond: "Dupla checagem independente na prescrição, no preparo e na administração.", ref: ["ISMP"] });
    const ctl = list.filter(d => d.ctl);
    if (ctl.length) add({ tipo: "info", sev: 0, titulo: "Medicamentos controlados", drugs: ctl, mec: "Exigem receituário e registro (Portaria SVS/MS 344/98).", cond: "Conferir notificação/receita e escrituração.", ref: ["P344"] });
    out.sort((a, b) => b.sev - a.sev);
    return out;
  }
  function report(alerts, patient, names) {
    const L = ["TRIAGEM DE PRESCRIÇÃO (apoio à decisão; não substitui a análise farmacêutica)",
      "Paciente: faixa " + (patient.age || "-") + (patient.crcl != null ? "; ClCr " + patient.crcl + " mL/min" : "") + (patient.hepatic ? "; insuficiência hepática" : ""),
      "Itens: " + names.join("; "), ""];
    if (!alerts.length) L.push("Nenhum alerta pelas regras cadastradas (isso NÃO exclui interações não cobertas).");
    alerts.forEach((a, i) => L.push((i + 1) + ". [" + SEV[a.sev].toUpperCase() + "] " + a.titulo + " — " + a.drugs.map(d => d.name.split(/[\d(,]/)[0].trim()).join(" + "), "   Mecanismo/risco: " + a.mec, "   Conduta sugerida: " + a.cond, ""));
    return L.join("\n");
  }
  return { analyze, report, ingOf, SEV, norm };
});
