/* Dose do paciente: dose mínima, recomendada e máxima por peso, com avisos de subdose/superdose.
   Faixas: data/dose.json (base ICAM, compilada por IA; revisão farmacêutica obrigatória). Motor 100% offline.
   Integra e amplia o motor original da calculadora do ICAM (calcularDose / avaliarDosePrescrita / dose unitária / frascos). */
(function (root, factory) { if (typeof module === "object" && module.exports) module.exports = factory(); else root.Dose = factory(); })(this, function () {
  const norm = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const rnd = (v, d) => { const f = Math.pow(10, d == null ? 2 : d); return Math.round((v + Number.EPSILON) * f) / f; };
  const STD = [1, 2, 3, 4, 6, 8, 12, 24, 48];
  const RENAL = { normal: "Função renal normal", leve: "Leve (TFG 60–89)", moderada: "Moderada (TFG 30–59)", grave: "Grave (TFG < 30)", dialise: "Diálise" };
  const HEPA = { normal: "Função hepática normal", leve: "Leve (Child-Pugh A)", moderada: "Moderada (Child-Pugh B)", grave: "Grave (Child-Pugh C)" };

  function faixaEtaria(idadeAnos) { // neonato: até 28 dias
    if (idadeAnos * 365.25 <= 28) return "neo";
    if (idadeAnos < 18) return "ped";
    if (idadeAnos < 65) return "adu";
    return "ido";
  }
  function idadeEmAnos(valor, unidade) { return unidade === "dias" ? valor / 365.25 : unidade === "meses" ? valor / 12 : valor; }
  /* TFG estimada: Schwartz à beira do leito (2009, < 18 anos, exige altura) ou Cockcroft-Gault (adultos). */
  function tfg(p) {
    if (!(p.scr > 0)) return null;
    if (p.idadeAnos < 18) return p.altura > 0 ? rnd(0.413 * p.altura / p.scr, 0) : null;
    if (!(p.peso > 0)) return null;
    const v = (140 - p.idadeAnos) * p.peso / (72 * p.scr);
    return rnd(p.sexo === "F" ? v * 0.85 : v, 0);
  }
  function renalDeTfg(t) { return t == null ? null : t >= 90 ? "normal" : t >= 60 ? "leve" : t >= 30 ? "moderada" : "grave"; }

  function intervalosPermitidos(med) {
    const lo = med.imin == null ? 4 : med.imin, hi = med.imax == null ? 24 : med.imax;
    let l = STD.filter(h => h >= lo && h <= hi);
    if (!l.length) l = [med.imin || med.imax || 8];
    return l;
  }
  function intervaloPadrao(med) { const l = intervalosPermitidos(med); return l.includes(8) && (med.imin == null || med.imin <= 8) ? 8 : l[0]; }

  function parseForma(f) { // "Ampola 3 mL", "Frasco 100 mL" -> {qtd:3, un:"mL"}
    const m = String(f).match(/(\d+[.,]?\d*)\s*(mL|mg|g)\b/i); return m ? { qtd: parseFloat(m[1].replace(",", ".")), un: m[2] } : null;
  }
  /* Converte mg em quantidade da apresentação (mL, comprimidos, g...). */
  function unidades(mg, ap) {
    if (!ap || !(ap.k > 0)) return null;
    const un = String(ap.u).includes("/") ? String(ap.u).split("/").pop() : "unidade(s)";
    return { q: mg / ap.k, un: un };
  }
  function fmtQ(q) { return q >= 100 ? Math.round(q) : q >= 10 ? rnd(q, 1) : rnd(q, 2); }

  /* Textos de risco por classe. */
  const RISK = [
    [/antimicrob|antibi|penicil|cefalo|cefalosp|aminoglic|glicopept|carbapen|macrol|quinolon|sulfa|lincos|polimix|oxazolid|glicilcic|nitroimid/, "falha do tratamento, persistência ou recidiva da infecção e seleção de resistência bacteriana", "toxicidade dose-dependente do antimicrobiano (renal, auditiva, neurológica ou hematológica conforme a classe) e superinfecção"],
    [/antif[uú]ng|antifungico/, "falha terapêutica e progressão da infecção fúngica, com risco de resistência", "hepatotoxicidade, nefrotoxicidade e alterações eletrolíticas conforme o antifúngico"],
    [/antivir|oseltamivir|aciclovir/, "falha antiviral e seleção de resistência", "toxicidade renal e neurológica conforme o antiviral"],
    [/antiparasit|antihelm|anti-helm|escabic|pediculic/, "falha do tratamento e persistência da parasitose", "efeitos neurológicos e hepáticos dose-dependentes"],
    [/anticonvuls|antiepilep|barbit|benzodiaz|hidantoin/, "perda do controle das crises, crises de repetição e risco de estado de mal epiléptico", "sedação excessiva, ataxia, depressão respiratória, toxicidade hepática ou hematológica conforme o fármaco"],
    [/opioide|opi[aá]ceo|analg[eé]sico opi/, "analgesia inadequada e, em uso contínuo, síndrome de abstinência", "depressão respiratória, sedação profunda, bradicardia, rigidez torácica e parada respiratória (reverter com naloxona)"],
    [/analg[eé]s|antit[eé]rm|anti-inflam|aine|antipir/, "dor ou febre não controladas", "hepatotoxicidade (paracetamol), lesão renal e sangramento gastrointestinal (AINEs)"],
    [/corticoid|glicocort/, "controle insuficiente da inflamação ou do broncoespasmo; insuficiência adrenal se houver uso prolongado e suspensão", "hiperglicemia, hipertensão, retenção hídrica, supressão adrenal, imunossupressão e distúrbios de humor"],
    [/broncodilat|beta-?2|agonista|antimuscar|asma/, "broncoespasmo e dispneia não controlados", "taquicardia, tremores, hipocalemia e arritmias"],
    [/antifibrin|hemost[aá]t|fitomenadiona|vitamina k/, "sangramento não controlado ou recorrente", "tromboembolismo, convulsões (doses altas) e alterações visuais"],
    [/ant[ií]doto|mucol[ií]t|reversor|antagonista/, "intoxicação ou efeito não revertido/tratado de forma adequada", "efeitos adversos dose-dependentes do antídoto (reações, náuseas, hipotensão) e reversão excessiva"],
    [/vitamin|suplement|polivitam|ferro|ant[ií]anem/, "deficiência não corrigida", "efeitos gastrointestinais e, no caso de ferro e vitaminas lipossolúveis, intoxicação"],
    [/anticoag|heparin|antitromb|antiagreg/, "trombose e embolia por anticoagulação insuficiente", "hemorragia grave (reverter conforme o fármaco)"],
    [/insulin|hipoglic|antidiab/, "hiperglicemia persistente e risco de cetoacidose", "hipoglicemia grave, convulsão e coma"],
    [/vasopress|inotr|cardiot|catecol|simpatomim/, "hipotensão e perfusão inadequada", "taquiarritmias, isquemia, hipertensão grave e necrose por extravasamento"],
    [/anti-?hipert|diur[eé]t|vasodilat|betabloq|ieca|bra\b/, "controle inadequado da pressão arterial ou do volume", "hipotensão, bradicardia, distúrbios eletrolíticos e lesão renal"],
    [/sedat|hipn|anest|bloqueador neuro|relaxante/, "sedação/analgesia/bloqueio insuficientes, com consciência e dor durante procedimentos", "depressão respiratória e cardiovascular, apneia e hipotensão"],
    [/eletr[oó]lit|potassio|magn[eé]s|c[aá]lcio|s[oó]dio/, "distúrbio hidroeletrolítico não corrigido", "distúrbios graves do eletrólito, arritmias cardíacas e parada"],
    [/antiem[eé]t|procin[eé]t|antiacid|inibidor de bomba/, "sintomas não controlados", "efeitos extrapiramidais, alteração do QT e sedação conforme o fármaco"],
    [/antipsic|neurolept/, "controle inadequado da agitação ou dos sintomas psicóticos", "sintomas extrapiramidais, prolongamento do QT, sedação e síndrome neuroléptica maligna"],
    [/antiem[eé]t|antihistam|anti-?histam/, "sintomas alérgicos ou eméticos não controlados", "sedação, efeitos anticolinérgicos e arritmias"],
  ];
  function riscoClasse(med, k) { const c = norm(med.c + " " + med.cat); for (const r of RISK) if (r[0].test(c)) return r[k]; return k === 1 ? "efeito terapêutico insuficiente, falha do tratamento e atraso na resposta clínica" : "toxicidade dose-dependente com efeitos adversos graves, aumentada em neonatos, lactentes e na disfunção renal ou hepática"; }

  /* ctx = {m: monografia do catálogo, s: segurança do catálogo} (opcional). */
  function riscos(med, ctx) {
    const sub = riscoClasse(med, 1);
    let sup = riscoClasse(med, 2);
    if (ctx && ctx.s) {
      const g = (ctx.s.ae || "").split("|").map(x => x.replace(/^(Comuns|Graves)[^:]*:\s*/, ""));
      if (g[1]) sup = "efeitos graves descritos na monografia: " + g[1].replace(/\.$/, "") + ". Também: " + sup;
      if (ctx.s.ismp) sup += ". É medicamento de ALTA VIGILÂNCIA (" + ctx.s.ismp + "): erro de dose pode causar dano grave";
    }
    return { sub, sup };
  }

  function rotulosCondicoes(pac) {
    const c = [];
    if (pac.renal && pac.renal !== "normal") c.push("renal " + pac.renal);
    if (pac.hepatica && pac.hepatica !== "normal") c.push("hepática " + pac.hepatica);
    if (pac.gestante) c.push("gestante/lactante"); if (pac.prematuro) c.push("prematuro"); if (pac.desidratacao) c.push("desidratação"); if (pac.desnutricao) c.push("desnutrição"); if (pac.outra) c.push("outra condição grave");
    return c;
  }

  /* Calcula as faixas de dose para o paciente. opts: {intervalo (h), ap (índice da apresentação), prescrita (mg por dose)} */
  function calcular(med, pac, ctx, opts) {
    opts = opts || {};
    const av = [], push = (sev, txt) => av.push({ sev, txt });
    if (!(pac.peso > 0)) throw new Error("Informe o peso do paciente (kg).");
    if (!(pac.idadeAnos >= 0)) throw new Error("Informe a idade do paciente.");
    const fe = faixaEtaria(pac.idadeAnos);
    const semFaixa = med.min == null || med.max == null;
    const intervalo = opts.intervalo || intervaloPadrao(med);
    const n = 24 / intervalo;
    const ap = med.ap[opts.ap || 0] || med.ap[0];
    const res = { fe, intervalo, dosesDia: n, ap, med, semFaixa, avisos: av, condicoes: rotulosCondicoes(pac), tfg: tfg(pac) };
    // condição que exige dose conservadora (fármaco com alerta renal/hepático)
    const nef = ctx && ctx.s ? ctx.s.nef : 0, hep = ctx && ctx.s ? ctx.s.hep : 0;
    const rrel = pac.renal || "normal", hrel = pac.hepatica || "normal";
    const renalImp = rrel === "moderada" || rrel === "grave" || rrel === "dialise";
    const hepImp = hrel === "moderada" || hrel === "grave";
    let conserv = false;
    if (renalImp && nef > 0) { conserv = true; push(2, "Função renal " + (rrel === "dialise" ? "em diálise" : rrel) + ": este medicamento tem alerta renal (" + ctx.s.nefN + "). A faixa padrão vale para função normal. Ajuste de dose/intervalo é necessário: use a dose conservadora abaixo apenas como ponto de partida e confirme em referência renal (bula, Lexicomp)."); }
    else if (renalImp) push(1, "Função renal " + (rrel === "dialise" ? "em diálise" : rrel) + ": confirme se o fármaco ou seus metabólitos são de eliminação renal e se há ajuste de dose/intervalo.");
    else if (rrel === "leve" && nef > 0) push(1, "Função renal levemente reduzida e medicamento com alerta renal (" + ctx.s.nefN + "): monitorar creatinina.");
    if (hepImp && hep > 0) { conserv = true; push(2, "Insuficiência hepática " + hrel + ": este medicamento tem alerta hepático (" + ctx.s.hepN + "). A faixa padrão vale para função normal; use a dose conservadora como ponto de partida e confirme o ajuste em referência."); }
    else if (hepImp) push(1, "Insuficiência hepática " + hrel + ": confirme metabolismo hepático e a necessidade de redução de dose.");
    else if (hrel === "leve" && hep > 0) push(1, "Insuficiência hepática leve e medicamento com alerta hepático (" + ctx.s.hepN + "): monitorar enzimas.");
    if (fe === "neo" || pac.prematuro) { conserv = true; push(2, (pac.prematuro ? "Prematuro" : "Neonato") + ": a faixa por peso pode não se aplicar (imaturidade renal e hepática, intervalo maior). Confirme dose e intervalo em referência neonatal (ex.: Neofax, Lexicomp Pediatric). A dose mostrada é conservadora."); }
    if (ctx && ctx.m && ctx.m.pa && (fe === "neo" || fe === "ped")) push(2, "Alerta pediátrico: " + ctx.m.pa);
    if (fe === "ido") push(1, "Idoso: iniciar com doses menores, considerar função renal/hepática reduzida e interações (critérios de Beers/STOPP).");
    if (pac.gestante) push(1, "Gestante/lactante: segurança fetal e na amamentação não consta na base. Confira a classificação do medicamento antes de usar.");
    if (pac.desidratacao) push(1, "Desidratação: reduz a depuração renal e aumenta o risco de toxicidade renal; reavalie dose e hidrate.");
    if (pac.desnutricao) push(1, "Desnutrição: pode alterar distribuição e ligação a proteínas; use peso real e monitore resposta e toxicidade.");
    if (pac.outra) push(1, "Condição grave informada: a base não ajusta a dose por essa condição; decisão clínica individualizada.");
    if (fe === "adu" || fe === "ido") push(1, "A base de faixas é pediátrica (mg/kg). Em adultos a dose é limitada pela dose máxima cadastrada; confira também a dose de adulto da monografia.");
    if (med.disp === false) push(1, "Item marcado como indisponível no formulário do ICAM.");
    if (semFaixa) { push(1, "Sem faixa de dose em mg/kg cadastrada para este item (uso tópico/nutricional ou depende da indicação). Avalie clinicamente."); return res; }
    // faixas por dose
    const kgDose = { min: med.min, max: med.max, rec: conserv ? med.min : (med.min + med.max) / 2 };
    res.kgDose = kgDose; res.conservadora = conserv;
    const capDia = (med.abs ? med.abs : Infinity), capKg = (med.dia ? med.dia * pac.peso : Infinity);
    const capDose = Math.min(capDia, capKg) / n;
    res.capDose = isFinite(capDose) ? capDose : null;
    const out = {};
    for (const k of ["min", "rec", "max"]) {
      let mg = kgDose[k] * pac.peso, capped = false;
      if (mg > capDose) { mg = capDose; capped = true; }
      out[k] = { mg, dia: mg * n, kgDia: mg * n / pac.peso, capped, u: unidades(mg, ap) };
    }
    res.doses = out;
    if (out.rec.capped || out.max.capped) push(1, "Dose limitada pelo teto " + (capDia <= capKg ? "absoluto (" + med.abs + " mg/dia)" : "diário (" + med.dia + " mg/kg/dia)") + " a cada " + intervalo + " h.");
    if (med.obs) res.obs = med.obs;
    // frascos / ampolas
    const pf = parseForma(ap.f);
    if (pf && ap.u && /\/(mL|frasco)/.test(ap.u) && out.rec.u) {
      let vol = null;
      if (pf.un.toLowerCase() === "ml" && out.rec.u.un === "mL") vol = { quant: out.rec.u.q, por: pf.qtd, un: "mL" };
      if (vol) { const nF = Math.max(1, Math.ceil(rnd(vol.quant / vol.por, 6))); res.frascos = { n: nF, sobra: rnd(nF * vol.por - vol.quant, 3), un: "mL", por: vol.por, forma: ap.f }; }
    }
    // dose prescrita
    if (opts.prescrita != null && opts.prescrita > 0) res.avaliacao = avaliar(med, pac, ctx, res, opts.prescrita);
    return res;
  }

  function avaliar(med, pac, ctx, res, mg) {
    const n = res.dosesDia, kgDose = mg / pac.peso, kgDia = kgDose * n, mgDia = mg * n, r = riscos(med, ctx);
    const out = { mg, kgDose: rnd(kgDose, 3), kgDia: rnd(kgDia, 3), mgDia: rnd(mgDia, 2), status: "adequada", motivos: [], riscos: [] };
    const minMg = res.doses.min.mg, maxMg = res.doses.max.mg;
    if (res.conservadora && mg > res.doses.rec.mg && mg <= maxMg) out.motivos.push("Acima da dose conservadora indicada para as condições do paciente (" + fmtQ(res.doses.rec.mg) + " mg).");
    if (mg < minMg * 0.999) {
      out.status = mg < minMg * 0.5 ? "subdose_importante" : "subdose";
      out.motivos.push("Dose de " + fmtQ(mg) + " mg está " + Math.round(mg / minMg * 100) + "% da dose mínima (" + fmtQ(minMg) + " mg por dose).");
      out.riscos.push("Risco da subdose: " + r.sub + ".");
    }
    const excedeAbs = med.abs && mgDia > med.abs * 1.0001, excedeKg = med.dia && kgDia > med.dia * 1.0001;
    if (mg > maxMg * 1.0001 || excedeAbs || excedeKg) {
      out.status = mg > maxMg * 2 || (med.abs && mgDia > med.abs * 2) ? "superdose_importante" : "superdose";
      if (mg > maxMg * 1.0001) out.motivos.push("Dose de " + fmtQ(mg) + " mg está " + Math.round(mg / maxMg * 100) + "% da dose máxima (" + fmtQ(maxMg) + " mg por dose).");
      if (excedeKg) out.motivos.push("Dose diária de " + rnd(kgDia, 2) + " mg/kg/dia excede o máximo de " + med.dia + " mg/kg/dia.");
      if (excedeAbs) out.motivos.push("Dose diária de " + rnd(mgDia, 1) + " mg/dia excede o teto absoluto de " + med.abs + " mg/dia.");
      out.riscos.push("Risco da superdose: " + r.sup + ".");
      if (pac.peso < 15 || res.fe === "neo") out.riscos.push("Em neonatos e crianças pequenas a margem de segurança é estreita: um erro de dose (inclusive de 10 vezes por vírgula) pode ser fatal. Reconfira o cálculo e a diluição.");
    }
    const ren = pac.renal && pac.renal !== "normal", hep = pac.hepatica && pac.hepatica !== "normal";
    if ((out.status.startsWith("superdose")) && (ren || hep)) out.riscos.push("Com " + [ren ? "insuficiência renal" : "", hep ? "insuficiência hepática" : ""].filter(Boolean).join(" e ") + ", a eliminação do fármaco é menor e o risco de acúmulo e toxicidade é maior.");
    out.riscos.push("Apoio à decisão: confirme com o prescritor e o farmacêutico responsável antes de dispensar ou administrar.");
    return out;
  }

  function parecer(res, pac, opts) {
    const m = res.med, L = ["DOSE DO PACIENTE (apoio à decisão; não substitui a análise farmacêutica)",
      "Paciente: " + (pac.idadeTxt || "") + "; sexo " + (pac.sexo || "-") + "; peso " + pac.peso + " kg" + (res.tfg != null ? "; TFG estimada " + res.tfg + " mL/min" : "") + (res.condicoes.length ? "; condições: " + res.condicoes.join(", ") : ""),
      "Medicamento: " + m.n + " (" + res.ap.f + "); intervalo " + res.intervalo + " h", ""];
    if (res.doses) for (const [k, t] of [["min", "Mínima"], ["rec", res.conservadora ? "Recomendada (conservadora)" : "Recomendada"], ["max", "Máxima"]]) { const d = res.doses[k]; L.push(t + ": " + fmtQ(d.mg) + " mg por dose" + (d.u ? " = " + fmtQ(d.u.q) + " " + d.u.un : "") + " (" + fmtQ(d.dia) + " mg/dia; " + rnd(d.kgDia, 2) + " mg/kg/dia)"); }
    if (res.avaliacao) { const a = res.avaliacao; L.push("", "Dose prescrita: " + a.mg + " mg por dose → " + a.status.toUpperCase().replace("_", " ")); a.motivos.forEach(x => L.push("  - " + x)); a.riscos.forEach(x => L.push("  - " + x)); }
    L.push(""); res.avisos.forEach(a => L.push("[" + (a.sev === 2 ? "GRAVE" : "ATENÇÃO") + "] " + a.txt));
    return L.join("\n");
  }
  return { calcular, avaliar, riscos, tfg, renalDeTfg, faixaEtaria, idadeEmAnos, intervalosPermitidos, intervaloPadrao, fmtQ, parecer, RENAL, HEPA, norm };
});
