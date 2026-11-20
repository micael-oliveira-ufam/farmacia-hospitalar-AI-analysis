/**
 * Motor de cálculos para avaliação de prescrições pediátricas — ICAM.
 *
 * Porta em JavaScript (100% client-side) da lógica originalmente escrita
 * em Python (ver calculos.py + tests/test_calculos.py no repositório).
 * Mantida deliberadamente próxima da versão Python para reduzir o risco
 * de divergência entre as duas implementações.
 */
(function (global) {
  "use strict";

  const ORDEM_GRAVIDADE = { grave: 3, moderada: 2, leve: 1 };

  const SEV_LABEL = { 0: "leve", 1: "moderada", 2: "grave", 3: "grave" };

  // Mapa de aliases: IDs genéricos do interacoes.json → IDs reais do sistema.
  const ALIAS_IDS = {
    "ibuprofeno": ["ibuprofeno_comp", "ibuprofeno_gts"],
    "prednisolona": ["prednisolona_susp"],
    "prednisona": ["prednisona"],
    "dexametasona": ["dexametasona_inj", "dexametasona_elixir", "dexametasona_creme"],
    "metilprednisolona": ["metilprednisolona"],
    "hidrocortisona": ["hidrocortisona"],
    "diazepam": ["diazepam_comp", "diazepam_inj"],
    "midazolam injetavel": ["midazolam"],
    "insulina": ["insulina_regular", "insulina_nph"],
    "ciprofloxacino": ["ciprofloxacino_comp", "ciprofloxacino_inj"],
    "claritromicina": ["claritromicina_susp", "claritromicina_inj"],
    "azitromicina": ["azitromicina_comp", "azitromicina_susp"],
    "metoclopramida": ["metoclopramida_gts", "metoclopramida_inj"],
    "bromoprida": ["bromoprida_gts", "bromoprida_inj"],
    "fenobarbital": ["fenobarbital_comp", "fenobarbital_inj", "fenobarbital_susp"],
    "carbamazepina": ["carbamazepina_comp", "carbamazepina_susp"],
    "valproato": ["valproato_xarope"],
    "valproato de sodio": ["valproato_xarope"],
    "clonazepam": ["clonazepam_comp", "clonazepam_gts"],
    "haloperidol": ["haloperidol_comp", "haloperidol_gts", "haloperidol_inj"],
    "losartana potassica": ["losartana"],
    "enoxaparina sodica": ["enoxaparina"],
    "heparina": ["heparina_sodica"],
    "fluconazol": ["fluconazol_comp", "fluconazol_inj"],
    "omeprazol": ["omeprazol_comp", "omeprazol_inj"],
    "metronidazol": ["metronidazol_comp", "metronidazol_inj"],
    "sulfametoxazol": ["sulfametoxazol_trimetoprima_susp", "sulfametoxazol_trimetoprima_inj"],
    "piperacilina": ["piperacilina_tazobactam"],
    "salbutamol": ["salbutamol_nebulizacao", "salbutamol_spray", "salbutamol_xarope", "salbutamol_inj"],
    "brometo de ipratropio": ["brometo_ipratropio"],
    "tobramicina": ["tobramicina_oftalmica"],
    "polimixina b": ["polimixina_b"],
    "anfotericina b": ["anfotericina_b"],
    "anfotericina b lipossomal": ["anfotericina_lipossomal"],
    "hidroxizina": ["hidroxizine"],
    "hidroxido de aluminio": ["hidroxido_aluminio"],
    "cloreto de potassio": ["cloreto_potassio_10", "cloreto_potassio_xarope"],
    "gluconato de calcio": ["gliconato_calcio"],
    "carbonato de calcio": ["carbonato_calcio"],
    "sulfato de magnesio": ["sulfato_magnesio"],
    "sulfato ferroso": ["sulfato_ferroso"],
    "acido acetilsalicilico": ["aas"],
    "remifentanil": ["remifentanila"],
    "tenoxicam po injetavel": ["tenoxicam"],
    "contraste": ["contraste_nao_ionico", "contraste_meglumina"],
  };

  function _expandirId(medId) {
    return ALIAS_IDS[medId] || [medId];
  }

  /**
   * Normaliza interacoes.json para lista plana compatível com verificarInteracoes().
   * Suporta formato legado (array) e novo formato (objeto com grupos/regras).
   * medicamentosDb: objeto {id: medicamento} para filtrar pares inválidos.
   */
  function normalizarInteracoes(raw, medicamentosDb) {
    if (Array.isArray(raw)) return raw; // formato legado

    const medicamentosValidos = new Set(Object.keys(medicamentosDb || {}));

    // Expande aliases dentro dos grupos
    const gruposRaw = raw.grupos || {};
    const grupos = {};
    for (const [nome, membros] of Object.entries(gruposRaw)) {
      const expandidos = [];
      for (const m of membros) {
        for (const alias of _expandirId(m)) expandidos.push(alias);
      }
      grupos[nome] = expandidos;
    }

    const regras = raw.regras || [];
    const resultado = [];
    const vistos = new Set();

    function adicionar(medA, medB, gravidade, descricao) {
      if (medicamentosValidos.size > 0 &&
          (!medicamentosValidos.has(medA) || !medicamentosValidos.has(medB))) return;
      const par = [medA, medB].sort().join("||");
      if (vistos.has(par)) return;
      vistos.add(par);
      resultado.push({ medicamentos: [medA, medB], gravidade, descricao });
    }

    for (const regra of regras) {
      const aRaw = regra.a;
      const bRaw = regra.b;
      if (!aRaw) continue;

      const membrosA = aRaw.startsWith("@")
        ? (grupos[aRaw.slice(1)] || [])
        : _expandirId(aRaw);

      const gravidade = SEV_LABEL[parseInt(regra.sev ?? 1, 10)] || "moderada";
      let descricao = regra.titulo || "";
      if (regra.mec) descricao += ` — ${regra.mec}`;
      if (regra.cond) descricao += ` Conduta: ${regra.cond}`;

      if (bRaw === null || bRaw === undefined) {
        // Regra intragrupo: todos os pares dentro de membrosA
        for (let i = 0; i < membrosA.length; i++) {
          for (let j = i + 1; j < membrosA.length; j++) {
            adicionar(membrosA[i], membrosA[j], gravidade, descricao);
          }
        }
        continue;
      }

      const membrosB = bRaw.startsWith("@")
        ? (grupos[bRaw.slice(1)] || [])
        : _expandirId(bRaw);

      for (const medA of membrosA) {
        for (const medB of membrosB) {
          adicionar(medA, medB, gravidade, descricao);
        }
      }
    }

    return resultado;
  }

  function round(valor, casas) {
    const fator = Math.pow(10, casas);
    return Math.round((valor + Number.EPSILON) * fator) / fator;
  }

  function calcularDose(pesoKg, doseMgKg, dosesPorDia) {
    if (!(pesoKg > 0)) throw new Error("Peso deve ser maior que zero.");
    if (doseMgKg < 0) throw new Error("Dose mg/kg não pode ser negativa.");
    if (!(dosesPorDia > 0)) throw new Error("Número de doses por dia deve ser maior que zero.");

    const dosePorAdministracao = pesoKg * doseMgKg;
    const doseDiariaTotal = dosePorAdministracao * dosesPorDia;
    const doseMgKgDia = doseMgKg * dosesPorDia;

    return {
      dose_por_administracao_mg: round(dosePorAdministracao, 3),
      dose_diaria_total_mg: round(doseDiariaTotal, 3),
      dose_mg_kg_dose: round(doseMgKg, 3),
      dose_mg_kg_dia: round(doseMgKgDia, 3),
    };
  }

  function avaliarDosePrescrita(medicamento, pesoKg, dosePrescritaMg, dosesPorDia) {
    const doseMgKgDose = dosePrescritaMg / pesoKg;
    const doseMgKgDia = doseMgKgDose * dosesPorDia;
    const doseDiariaTotalMg = dosePrescritaMg * dosesPorDia;

    const faixaMin = medicamento.dose_min_mg_kg_dose;
    const faixaMax = medicamento.dose_max_mg_kg_dose;
    const maxDiaKg = medicamento.dose_max_dia_mg_kg;
    const maxAbsoluta = medicamento.dose_max_absoluta_mg_dia;

    const excedeAbsoluta = !!maxAbsoluta && doseDiariaTotalMg > maxAbsoluta;
    const excedeDiaKg = !!maxDiaKg && doseMgKgDia > maxDiaKg;

    let status, mensagem;
    if (faixaMin == null || faixaMax == null) {
      status = "sem_referencia";
      mensagem = "Não há faixa de referência cadastrada para este medicamento; avalie clinicamente.";
    } else if (doseMgKgDose < faixaMin) {
      status = "abaixo";
      const percentual = faixaMin ? (doseMgKgDose / faixaMin) * 100 : 0;
      mensagem = `Dose abaixo da faixa recomendada (${faixaMin}-${faixaMax} mg/kg/dose). Corresponde a ${percentual.toFixed(0)}% do mínimo recomendado.`;
    } else if (doseMgKgDose > faixaMax) {
      status = "acima";
      const percentual = faixaMax ? (doseMgKgDose / faixaMax) * 100 : 0;
      mensagem = `Dose ACIMA da faixa recomendada (${faixaMin}-${faixaMax} mg/kg/dose). Corresponde a ${percentual.toFixed(0)}% do máximo recomendado.`;
    } else {
      status = "adequada";
      mensagem = `Dose dentro da faixa recomendada (${faixaMin}-${faixaMax} mg/kg/dose).`;
    }

    if (excedeDiaKg) {
      mensagem += ` ATENÇÃO: dose diária total (${doseMgKgDia.toFixed(2)} mg/kg/dia) excede o máximo diário recomendado (${maxDiaKg} mg/kg/dia).`;
    }
    if (excedeAbsoluta) {
      mensagem += ` ATENÇÃO: dose diária total (${doseDiariaTotalMg.toFixed(1)} mg/dia) excede a dose máxima absoluta recomendada (${maxAbsoluta} mg/dia).`;
    }

    return {
      status,
      mensagem,
      dose_mg_kg_dose: round(doseMgKgDose, 3),
      dose_mg_kg_dia: round(doseMgKgDia, 3),
      faixa_min_mg_kg_dose: faixaMin ?? null,
      faixa_max_mg_kg_dose: faixaMax ?? null,
      excede_dose_maxima_absoluta: excedeAbsoluta,
      excede_dose_maxima_dia: excedeDiaKg,
    };
  }

  function calcularDoseUnitaria(doseMg, concentracao, unidadeConcentracao) {
    if (!(concentracao > 0)) throw new Error("Concentração deve ser maior que zero.");
    const quantidade = doseMg / concentracao;
    const partes = String(unidadeConcentracao).split("/");
    const unidadeDestino = partes.length > 1 ? partes[partes.length - 1] : "unidade(s)";
    const q = round(quantidade, 3);
    return {
      quantidade: q,
      unidade: unidadeDestino,
      mensagem: `Administrar ${q} ${unidadeDestino} para atingir ${doseMg} mg.`,
    };
  }

  function calcularNumeroFrascos(doseTotal, quantidadePorFrasco, unidade) {
    unidade = unidade || "mg";
    if (!(quantidadePorFrasco > 0)) throw new Error("Quantidade por frasco deve ser maior que zero.");
    if (doseTotal < 0) throw new Error("Dose total não pode ser negativa.");

    let numeroFrascos = Math.ceil(round(doseTotal / quantidadePorFrasco, 6));
    numeroFrascos = doseTotal > 0 ? Math.max(numeroFrascos, 1) : 0;
    const quantidadeDisponivel = numeroFrascos * quantidadePorFrasco;
    const sobra = round(quantidadeDisponivel - doseTotal, 3);

    return {
      numero_frascos: numeroFrascos,
      quantidade_total_disponivel: round(quantidadeDisponivel, 3),
      sobra,
      unidade,
    };
  }

  function verificarInteracoes(idsMedicamentos, medicamentosDb, interacoesDb) {
    const idsUnicos = [...new Set(idsMedicamentos)];
    const mapaInteracoes = new Map();
    for (const interacao of interacoesDb) {
      const chave = [...interacao.medicamentos].sort().join("||");
      mapaInteracoes.set(chave, interacao);
    }

    const encontradas = [];
    for (let i = 0; i < idsUnicos.length; i++) {
      for (let j = i + 1; j < idsUnicos.length; j++) {
        const chave = [idsUnicos[i], idsUnicos[j]].sort().join("||");
        const interacao = mapaInteracoes.get(chave);
        if (interacao) {
          const nomeA = medicamentosDb[idsUnicos[i]]?.nome || idsUnicos[i];
          const nomeB = medicamentosDb[idsUnicos[j]]?.nome || idsUnicos[j];
          encontradas.push({
            medicamento_a: nomeA,
            medicamento_b: nomeB,
            gravidade: interacao.gravidade,
            descricao: interacao.descricao,
          });
        }
      }
    }

    encontradas.sort((a, b) => (ORDEM_GRAVIDADE[b.gravidade] || 0) - (ORDEM_GRAVIDADE[a.gravidade] || 0));
    return encontradas;
  }

  global.Calculos = {
    calcularDose,
    avaliarDosePrescrita,
    calcularDoseUnitaria,
    calcularNumeroFrascos,
    verificarInteracoes,
    normalizarInteracoes,
  };
})(window);
