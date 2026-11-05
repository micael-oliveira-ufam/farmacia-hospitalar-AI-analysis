from dsl import B, NR, IDO, DESC
P = {}

_sx = B(0.1, 0.1, 0.15, "mg/kg", (6, 8), 0.6, "0,1–0,15 mg/kg/dose a cada 6–8 h (máx. 0,6 mg/kg/dia).", capd=20)
P["salbutamol_xarope"] = dict(neo=NR("Não recomendado por via oral."), lac=_sx, cri=_sx, adl=_sx,
    adu=B(2, 4, 4, "mg", (6, 8), 16, "2–4 mg 3–4×/dia."),
    ido=IDO(0.5, "Iniciar com 2 mg; atenção a taquiarritmias e hipocalemia."))

_dx = B(0.15, 0.15, 0.6, "mg/kg", None, None, "Crupe: 0,15–0,6 mg/kg em dose única (máx. 16 mg). Meningite: 0,15 mg/kg 6/6 h por 2–4 dias. Antiemético: 0,15 mg/kg.", cap=16)
P["dexametasona_elixir"] = dict(
    neo=B(0.075, 0.075, 0.075, "mg/kg", (12,), 0.15, "Extubação/displasia (protocolo DART): 0,075 mg/kg/dose 12/12 h, com redução progressiva, sob neonatologista."),
    lac=_dx, cri=_dx, adl=_dx,
    adu=B(4, 8, 10, "mg", (6, 12, 24), 40, "Antiemético: 4–8 mg. Edema cerebral: 10 mg e 4 mg 6/6 h. Meningite: 10 mg 6/6 h por 4 dias. Habitualmente ≤ 40 mg/dia."),
    ido=IDO(1, "Hiperglicemia, delirium e osteoporose: menor dose eficaz pelo menor tempo."))

P["loratadina"] = dict(neo=NR("Não recomendado."), lac=NR("Não recomendada em < 2 anos."),
    cri=B(5, 5, 10, "mg", (24,), 10, "≥ 2 anos: ≤ 30 kg 5 mg 1×/dia; > 30 kg 10 mg 1×/dia."),
    adl=B(10, 10, 10, "mg", (24,), 10, "10 mg 1×/dia."),
    adu=B(10, 10, 10, "mg", (24,), 10, "10 mg 1×/dia."),
    ido=IDO(1, "Hepatopatia grave: 10 mg a cada 48 h."))

_kcl = B(1, 2, 5, "mEq/kg/dia", (6, 8, 12), 5, "Prevenção: 1–2 mEq/kg/dia; tratamento: 2–5 mEq/kg/dia ÷ 2–4 doses. Guiar pelo K⁺ sérico; diluir bem.", capd=100)
P["cloreto_potassio_xarope"] = dict(
    neo=B(1, 1.5, 2, "mEq/kg/dia", (6, 8, 12), 2, "1–2 mEq/kg/dia ÷ 2–4 doses; guiar pelo K⁺ sérico."),
    lac=_kcl, cri=_kcl, adl=_kcl,
    adu=B(20, 40, 100, "mEq/dia", (6, 8, 12, 24), 100, "Prevenção: 20 mEq/dia; tratamento: 40–100 mEq/dia (doses > 20 mEq divididas). Individualizar pelo K⁺."),
    ido=IDO(0.5, "Hiperpotassemia na insuficiência renal e com IECA/BRA/espironolactona."))

_ap = "Aplicar camada fina 1–2×/dia na área afetada, pelo menor tempo; evitar face, dobras e áreas extensas (absorção sistêmica)."
P["dexametasona_creme"] = dict(neo=DESC("Evitar; se indispensável, área pequena e curto prazo, sob orientação especializada."),
    lac=DESC(_ap + " Em fralda (oclusão), evitar."), cri=DESC(_ap), adl=DESC(_ap), adu=DESC(_ap), ido=DESC(_ap + " Pele fina: risco de atrofia."))

P["lidocaina_gel"] = dict(
    neo=DESC("Quantidade mínima; dose cumulativa ≤ 3 mg/kg (≈ 0,15 g/kg de gel 2%), sob orientação especializada."),
    lac=DESC("Quantidade mínima; dose cumulativa ≤ 4,5 mg/kg (≈ 0,2 g/kg de gel 2%; máx. 15 g)."),
    cri=DESC("Quantidade mínima; dose cumulativa ≤ 4,5 mg/kg (≈ 0,2 g/kg de gel 2%; máx. 15 g)."),
    adl=DESC("Quantidade mínima; dose cumulativa ≤ 4,5 mg/kg (máx. 300 mg = 15 g de gel 2%)."),
    adu=DESC("Quantidade mínima necessária; dose cumulativa máx. 300 mg (15 g de gel 2%); cuidado em mucosas extensas."),
    ido=DESC("Quantidade mínima; reduzir em hepatopatia/insuficiência cardíaca (dose máx. 300 mg)."))

_mz = "2×/dia por 2–4 semanas, mantendo 1 semana após a cura."
P["miconazol_derma"] = dict(neo=DESC("Candidíase de fralda: 2×/dia."), lac=DESC(_mz), cri=DESC(_mz), adl=DESC(_mz), adu=DESC(_mz), ido=DESC(_mz))

_mg = "1 aplicador cheio ao deitar por 7 dias (conforme bula do creme vaginal)."
_mgn = "Uso vaginal restrito a adolescentes e adultas."
P["miconazol_ginecologico"] = dict(neo=NR(_mgn), lac=NR(_mgn), cri=NR(_mgn), adl=DESC(_mg), adu=DESC(_mg), ido=DESC(_mg))

_mu = "3×/dia por até 10 dias."
P["mupirocina"] = dict(neo=DESC("Dados limitados; apenas sob orientação especializada."),
    lac=DESC("≥ 3 meses: " + _mu), cri=DESC(_mu), adl=DESC(_mu), adu=DESC(_mu), ido=DESC(_mu))

P["neomicina_bacitracina"] = dict(neo=NR("Evitar (absorção e ototoxicidade)."),
    lac=DESC("2–3×/dia em área pequena; não aplicar em > 20% da superfície corporal."),
    cri=DESC("2–3×/dia em área pequena; não aplicar em > 20% da superfície corporal."),
    adl=DESC("2–3×/dia em área pequena; não aplicar em > 20% da superfície corporal."),
    adu=DESC("2–5×/dia; não usar em grandes áreas lesadas."),
    ido=DESC("2–3×/dia em área pequena; risco de ototoxicidade e nefrotoxicidade em lesões extensas."))

_nz = "Camada fina a cada troca de fralda (3–4×/dia); manter 48 h após a melhora."
P["nistatina_oxido_zinco"] = dict(neo=DESC(_nz), lac=DESC(_nz), cri=DESC(_nz),
    adl=DESC("Camada fina 2–3×/dia nas áreas afetadas."), adu=DESC("Camada fina 2–3×/dia nas áreas afetadas (dobras/incontinência)."), ido=DESC("Camada fina 2–3×/dia nas áreas afetadas."))

_oz = "A cada troca de fralda ou conforme necessidade."
P["oxido_zinco_pasta"] = dict(neo=DESC("A cada troca de fralda."), lac=DESC(_oz), cri=DESC(_oz), adl=DESC("Conforme necessidade."), adu=DESC("Conforme necessidade."), ido=DESC("Conforme necessidade."))
P["oxido_zinco_vit_a_d"] = dict(neo=DESC("A cada troca de fralda."), lac=DESC(_oz), cri=DESC(_oz), adl=DESC("Conforme necessidade."), adu=DESC("Conforme necessidade."), ido=DESC("Conforme necessidade."))

P["creme_barreira"] = dict(neo=DESC("Conforme protocolo de cuidados com a pele."), lac=DESC("A cada troca de fralda/higiene."), cri=DESC("A cada troca de fralda/higiene."),
    adl=DESC("A cada higiene ou 8–12 h."), adu=DESC("A cada higiene ou 8–12 h."), ido=DESC("A cada higiene ou 8–12 h (prevenção de dermatite associada à incontinência)."))

_dl = "Aplicar no couro cabeludo úmido, deixar agir pelo tempo da bula e enxaguar; repetir em 7 dias se necessário."
_dln = "Uso em < 2 anos apenas sob orientação médica."
P["deltrametrina"] = dict(neo=NR(_dln), lac=NR(_dln), cri=DESC(_dl), adl=DESC(_dl), adu=DESC(_dl), ido=DESC(_dl))

P["permetrina"] = dict(neo=NR("< 2 meses: segurança não estabelecida."),
    lac=DESC("≥ 2 meses: aplicar do pescoço aos pés (incluir couro cabeludo e face, poupando olhos e boca), remover após 8–14 h; repetir em 7 dias."),
    cri=DESC("Aplicar do pescoço aos pés, remover após 8–14 h; repetir em 7 dias (1 aplicação por vez)."),
    adl=DESC("Aplicar do pescoço aos pés, remover após 8–14 h; repetir em 7 dias."),
    adu=DESC("Aplicar do pescoço aos pés, remover após 8–14 h; repetir em 7 dias (até 30 g por aplicação)."),
    ido=DESC("Incluir o couro cabeludo; remover após 8–14 h; repetir em 7 dias."))

P["beclometasona_inal"] = dict(neo=NR("Não estabelecido."),
    lac=B(400, 400, 400, "mcg", (12, 24), 800, "400 mcg (½ flaconete) 1–2×/dia; manutenção, não é resgate agudo."),
    cri=B(400, 400, 400, "mcg", (12, 24), 800, "400 mcg (½ flaconete) 1–2×/dia; manutenção, não é resgate agudo."),
    adl=B(400, 400, 800, "mcg", (12, 24), 1600, "400–800 mcg 1–2×/dia; manutenção."),
    adu=B(800, 800, 800, "mcg", (12, 24), 1600, "800 mcg (1 flaconete) 1–2×/dia (máx. 1.600 mcg/dia)."),
    ido=IDO(1, "Candidíase oral: enxaguar a boca."))

P["brometo_ipratropio"] = dict(
    neo=B(25, 25, 25, "mcg/kg", (8,), None, "Dados limitados: 25 mcg/kg/dose 3×/dia."),
    lac=B(125, 250, 250, "mcg", (6, 8), 1000, "Crise: 250 mcg (lactentes 125–250 mcg) a cada 20 min por 3 doses, junto ao β2; manutenção: 250 mcg 3–4×/dia."),
    cri=B(250, 250, 250, "mcg", (6, 8), 1000, "< 12 anos: crise 250 mcg a cada 20 min por 3 doses, junto ao β2; manutenção 250 mcg 3–4×/dia."),
    adl=B(250, 500, 500, "mcg", (6, 8), 2000, "Crise: 250–500 mcg a cada 20 min por 3 doses; manutenção 250–500 mcg 3–4×/dia."),
    adu=B(500, 500, 500, "mcg", (6, 8), 2000, "Crise: 500 mcg a cada 20 min por 3 doses; manutenção 500 mcg 3–4×/dia (máx. 2 mg/dia)."),
    ido=IDO(1, "Glaucoma de ângulo fechado e retenção urinária."))

P["cloreto_sodio_inal"] = dict(neo=DESC("2–3 mL como veículo da nebulização."), lac=DESC("3–5 mL como veículo da nebulização."), cri=DESC("3–5 mL como veículo da nebulização."),
    adl=DESC("3–5 mL como veículo da nebulização."), adu=DESC("3–5 mL como veículo da nebulização."), ido=DESC("3–5 mL como veículo da nebulização."))

_sn = B(0.1, 0.15, 0.15, "mg/kg", (4, 6), None, "0,1–0,15 mg/kg/dose (dose usual 2,5–5 mg; mín. 2,5 mg); crise: repetir a cada 20 min por 3 doses.", cap=5)
P["salbutamol_nebulizacao"] = dict(neo=NR("Uso inalatório de rotina não estabelecido; hiperpotassemia: ver via EV."),
    lac=_sn, cri=_sn, adl=_sn,
    adu=B(2.5, 2.5, 5, "mg", (4, 6), None, "2,5–5 mg/dose a cada 4–6 h; crise: repetir a cada 20 min por 3 doses."),
    ido=IDO(1, "Taquiarritmias e hipocalemia."))

_ss = B(100, 100, 200, "mcg", (4, 6), None, "1–2 jatos (100–200 mcg) por vez, com espaçador; crise: repetir a cada 20 min por até 3 vezes (conforme protocolo).")
P["salbutamol_spray"] = dict(neo=NR("Uso sob especialista."), lac=_ss, cri=_ss, adl=_ss,
    adu=B(100, 200, 400, "mcg", (4, 6), None, "1–2 jatos a cada 4–6 h (crise: até 4 jatos por vez, conforme protocolo), com espaçador."),
    ido=IDO(1, "Taquiarritmias e hipocalemia."))

P["dextrano_hipromelose"] = dict(neo=DESC("1 gota conforme necessidade."), lac=DESC("1–2 gotas conforme necessidade."), cri=DESC("1–2 gotas conforme necessidade."),
    adl=DESC("1–2 gotas 3–4×/dia ou conforme necessidade."), adu=DESC("1–2 gotas 3–4×/dia ou conforme necessidade."), ido=DESC("1–2 gotas 3–4×/dia ou conforme necessidade."))
