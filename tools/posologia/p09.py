from dsl import B, NR, IDO, DESC
P = {}

_pf = B(2.5, 3, 3.5, "mg/kg", None, None, "Indução (> 1 mês): 2,5–3,5 mg/kg; manutenção 9–15 mg/kg/h. Sedação contínua em UTI contraindicada em < 16 anos (síndrome da infusão do propofol).")
P["propofol"] = dict(neo=NR("Não recomendado."), lac=_pf, cri=_pf, adl=_pf,
    adu=B(1.5, 2, 2.5, "mg/kg", None, None, "Indução: 1,5–2,5 mg/kg; manutenção 4–12 mg/kg/h; sedação em UTI 0,3–4 mg/kg/h."),
    ido=IDO(0.6, "Indução 1–1,5 mg/kg; titular lentamente."))

P["sevoflurano"] = dict(neo=DESC("CAM ≈ 3,3%; titular pela CAM."),
    lac=DESC("Indução até 8%; manutenção 0,5–3%; CAM ≈ 3% (1–6 meses)."),
    cri=DESC("Indução até 8%; manutenção 0,5–3%; CAM ≈ 2,5% (3–12 anos)."),
    adl=DESC("Indução até 8%; manutenção 0,5–3%."),
    adu=DESC("Indução até 8%; manutenção 0,5–3%; CAM ≈ 2% (40 anos)."),
    ido=DESC("CAM ≈ 1,4% (80 anos); titular pela CAM."))

P["tiopental"] = dict(
    neo=B(3, 3.5, 4, "mg/kg", None, None, "3–4 mg/kg."),
    lac=B(5, 7, 8, "mg/kg", None, None, "Indução: 5–6 mg/kg (lactentes 7–8 mg/kg)."),
    cri=B(5, 5.5, 6, "mg/kg", None, None, "Indução: 5–6 mg/kg; estado de mal refratário: 2–3 mg/kg + 3–5 mg/kg/h.", cap=1000),
    adl=B(3, 4, 5, "mg/kg", None, None, "Indução: 3–5 mg/kg (máx. 1 g).", cap=1000),
    adu=B(3, 4, 5, "mg/kg", None, None, "Indução: 3–5 mg/kg (máx. 1 g).", cap=1000),
    ido=IDO(0.6, "Reduzir a dose."))

_cbz = dict(neo=NR("Não estabelecido."),
    lac=B(10, 15, 20, "mg/kg/dia", (6, 8, 12), 35, "10–20 mg/kg/dia (iniciar baixo e titular lentamente); suspensão ÷ 4 doses."),
    cri=B(10, 15, 35, "mg/kg/dia", (6, 8, 12), 35, "< 6 anos: 10–20 mg/kg/dia (máx. 35); 6–12 anos: 100 mg 12/12 h, manutenção 400–800 mg/dia (máx. 1.000 mg/dia).", capd=1000),
    adl=B(100, 200, 600, "mg", (8, 12), 1200, "200 mg 12/12 h, aumentar até 800–1.200 mg/dia."),
    adu=B(200, 400, 600, "mg", (8, 12), 1600, "200 mg 12/12 h, aumentar gradualmente até 800–1.200 mg/dia (máx. 1.600 mg/dia)."),
    ido=IDO(0.5, "Hiponatremia; iniciar com 100 mg 12/12 h."))
P["carbamazepina_susp"] = _cbz
P["carbamazepina_comp"] = _cbz

_clz = dict(neo=NR("Não estabelecido."),
    lac=B(0.01, 0.1, 0.2, "mg/kg/dia", (8, 12), 0.2, "< 10 anos ou < 30 kg: iniciar 0,01–0,03 mg/kg/dia ÷ 2–3; manutenção 0,1–0,2 mg/kg/dia ÷ 3."),
    cri=B(0.01, 0.1, 0.2, "mg/kg/dia", (8, 12), 0.2, "< 10 anos ou < 30 kg: iniciar 0,01–0,03 mg/kg/dia ÷ 2–3; manutenção 0,1–0,2 mg/kg/dia ÷ 3 (gotas 2,5 mg/mL: 1 gota ≈ 0,1 mg)."),
    adl=B(0.25, 0.5, 1, "mg", (8, 12), 20, "Epilepsia: 0,5 mg 3×/dia, até 20 mg/dia; pânico: 0,25 mg 2×/dia → 1 mg/dia."),
    adu=B(0.25, 0.5, 1, "mg", (8, 12), 20, "Epilepsia: 0,5 mg 3×/dia, até 20 mg/dia; pânico: 0,25 mg 2×/dia → 1 mg/dia (máx. 4 mg/dia)."),
    ido=IDO(0.5, "Quedas e sedação; menor dose."))
P["clonazepam_gts"] = _clz
P["clonazepam_comp"] = _clz

_fbo = dict(
    neo=B(3, 4, 5, "mg/kg/dia", (12, 24), None, "Manutenção: 3–5 mg/kg/dia (a dose de ataque é por via injetável)."),
    lac=B(3, 5, 6, "mg/kg/dia", (12, 24), None, "Manutenção: lactentes 5–6 mg/kg/dia."),
    cri=B(4, 6, 8, "mg/kg/dia", (12, 24), None, "Manutenção: 1–5 anos 6–8; 5–12 anos 4–6 mg/kg/dia."),
    adl=B(1, 2, 3, "mg/kg/dia", (12, 24), None, "Manutenção: 1–3 mg/kg/dia."),
    adu=B(1, 2, 3, "mg/kg/dia", (12, 24), None, "Manutenção: 1–3 mg/kg/dia."),
    ido=IDO(0.75, "Sedação prolongada; reduzir."))
P["fenobarbital_susp"] = _fbo
P["fenobarbital_comp"] = _fbo

_hn = "Off-label; monitorar QT e sintomas extrapiramidais."
_hal = lambda extra: dict(neo=NR("Não recomendado."), lac=NR("Não estabelecido."),
    cri=B(0.025, 0.05, 0.075, "mg/kg/dia", (8, 12), 0.15, "3–12 anos (off-label): 0,025–0,075 mg/kg/dia ÷ 2–3; máx. 0,15 mg/kg/dia." + extra),
    adl=B(0.5, 1, 5, "mg", (8, 12), 30, "0,5–5 mg 2–3×/dia; máx. habitual 30 mg/dia. " + _hn),
    adu=B(0.5, 1, 5, "mg", (8, 12), 30, "0,5–5 mg 2–3×/dia; máx. habitual 30 mg/dia. " + _hn),
    ido=B(0.5, 0.5, 2, "mg", (12, 24), 5, "Iniciar 0,5 mg/dia; aumento de mortalidade na demência; monitorar QT e sintomas extrapiramidais."))
P["haloperidol_gts"] = _hal(" Gotas 2 mg/mL: 1 gota ≈ 0,1 mg.")
P["haloperidol_comp"] = _hal("")

_vp = B(10, 20, 60, "mg/kg/dia", (8, 12), 60, "Iniciar 10–15 mg/kg/dia ÷ 2–3, aumentar 5–10 mg/kg/semana até 30–60 mg/kg/dia; hepatotoxicidade (maior risco < 2 anos).", capd=3000)
P["valproato_xarope"] = dict(neo=NR("Evitar."), lac=_vp, cri=_vp, adl=_vp,
    adu=B(15, 30, 60, "mg/kg/dia", (8, 12), 60, "15 mg/kg/dia, aumentar até 60 mg/kg/dia (máx. 3.000 mg/dia).", capd=3000),
    ido=IDO(0.5, "Iniciar com dose menor."))

_lev = dict(
    neo=B(10, 20, 30, "mg/kg", (12,), 60, "Off-label: 10 mg/kg 12/12 h, até 30 mg/kg 12/12 h."),
    lac=B(7, 14, 25, "mg/kg", (12,), 50, "1–6 meses: 7 mg/kg 12/12 h → 21; 6 meses–4 anos: 10 → 25 mg/kg 12/12 h."),
    cri=B(10, 20, 30, "mg/kg", (12,), 60, "4–15 anos: 10 mg/kg 12/12 h → 30 mg/kg 12/12 h.", cap=1500, capd=3000),
    adl=B(10, 20, 30, "mg/kg", (12,), 60, "10 mg/kg 12/12 h → 30 mg/kg 12/12 h (máx. 1.500 mg/dose).", cap=1500, capd=3000),
    adu=B(500, 1000, 1500, "mg", (12,), 3000, "500 mg 12/12 h, até 1.500 mg 12/12 h."),
    ido=IDO(1, "Ajustar pelo ClCr."))
P["levetiracetam_susp"] = _lev
P["levetiracetam_comp"] = _lev

_ur = B(5, 7.5, 10, "mg/kg", (8,), 30, "5–10 mg/kg 3×/dia.")
P["acido_ursodesoxicolico"] = dict(
    neo=B(5, 5, 10, "mg/kg", (8,), 30, "Colestase: 5 mg/kg 3×/dia (até 10 mg/kg 3×/dia)."),
    lac=_ur, cri=_ur, adl=_ur,
    adu=B(8, 13, 15, "mg/kg/dia", (12, 24), 15, "Cálculo biliar: 8–12 mg/kg/dia; CBP: 13–15 mg/kg/dia."),
    ido=IDO(1, "Sem ajuste."))

P["clobazam"] = dict(neo=NR("Não estabelecido."), lac=NR("Não estabelecido em < 2 anos."),
    cri=B(5, 10, 20, "mg/dia", (12, 24), 40, "≥ 2 anos: ≤ 30 kg 5 mg/dia → até 20 mg/dia; > 30 kg 10 mg/dia → até 40 mg/dia."),
    adl=B(10, 20, 40, "mg/dia", (12, 24), 40, "> 30 kg: 10 mg/dia → até 40 mg/dia."),
    adu=B(10, 15, 20, "mg/dia", (12, 24), 60, "10–20 mg/dia (máx. 60 mg/dia)."),
    ido=IDO(0.5, "Iniciar com 5 mg."))

_dz = B(0.1, 0.15, 0.3, "mg/kg", (8, 12), None, "0,1–0,3 mg/kg/dose a cada 8–12 h (iniciar na menor dose; máx. 10 mg/dose); sedação e depressão respiratória.", cap=10)
P["diazepam_comp"] = dict(neo=NR("Evitar."), lac=_dz, cri=_dz,
    adl=B(2, 5, 10, "mg", (8, 12), 40, "2–10 mg 2–4×/dia (máx. 40 mg/dia)."),
    adu=B(2, 5, 10, "mg", (6, 8, 12), 40, "2–10 mg 2–4×/dia (máx. 40 mg/dia)."),
    ido=IDO(0.4, "Reduzir a dose (meia-vida prolongada); risco de quedas e delirium."))

P["fluoxetina"] = dict(neo=NR("Não se aplica."), lac=NR("Não estabelecido."),
    cri=B(10, 20, 60, "mg", (24,), 60, "Depressão ≥ 8 anos: 10 mg/dia → 20 mg/dia; TOC ≥ 7 anos: 10 mg → 20–60 mg/dia."),
    adl=B(10, 20, 60, "mg", (24,), 60, "Depressão: 10 mg/dia → 20 mg/dia; TOC: 10 mg → 20–60 mg/dia."),
    adu=B(20, 20, 80, "mg", (24,), 80, "20 mg/dia (máx. 80 mg/dia)."),
    ido=IDO(0.75, "Máx. 60 mg/dia; hiponatremia."))

P["lamotrigina"] = dict(neo=NR("Não estabelecido."), lac=NR("Não estabelecido em < 2 anos."),
    cri=B(0.15, 0.3, 0.6, "mg/kg/dia", (12, 24), 15, "2–12 anos sem valproato: 0,3 mg/kg/dia por 2 sem → 0,6 por 2 sem; manutenção 1–15 mg/kg/dia. Com valproato: 0,15 → 0,3 mg/kg/dia; manutenção 1–5 mg/kg/dia. Titulação lenta (risco de Stevens-Johnson).", capd=400),
    adl=B(25, 50, 200, "mg/dia", (12, 24), 400, "25 mg/dia × 2 sem → 50 mg/dia × 2 sem; manutenção 100–200 mg/dia (com valproato: metade; com indutores: até 400–700)."),
    adu=B(25, 50, 200, "mg/dia", (12, 24), 500, "25 mg/dia × 2 sem → 50 mg/dia × 2 sem; manutenção 100–200 mg/dia (máx. 500 mg/dia; 700 com indutores)."),
    ido=IDO(1, "Sem ajuste específico; titulação lenta."))

_lo = B(0.02, 0.035, 0.05, "mg/kg", (4, 6, 8, 12), None, "Ansiedade (off-label): 0,05 mg/kg/dose a cada 4–8 h (máx. 2 mg/dose).", cap=2)
P["lorazepam"] = dict(neo=NR("Não recomendado."), lac=_lo, cri=_lo, adl=_lo,
    adu=B(0.5, 1, 2, "mg", (8, 12), 10, "2–3 mg/dia ÷ 2–3 doses (máx. 10 mg/dia)."),
    ido=B(0.25, 0.5, 1, "mg/dia", (12, 24), 2, "0,5–1 mg/dia; risco de quedas, sedação e delirium."))

_me = B(0.05, 0.1, 0.1, "mg/kg", (4, 6, 8, 12), None, "Dor: 0,1 mg/kg a cada 4 h por 2–3 doses, depois 6–12 h; desmame de opioide: 0,05–0,1 mg/kg a cada 6–12 h (máx. 5–10 mg/dose).", cap=10)
P["metadona"] = dict(
    neo=B(0.05, 0.075, 0.1, "mg/kg", (6, 12), None, "Abstinência neonatal: 0,05–0,1 mg/kg a cada 6–12 h."),
    lac=_me, cri=_me, adl=_me,
    adu=B(2.5, 2.5, 30, "mg", (8, 12), 40, "Dor (virgem de opioide): 2,5 mg 8/8 h; dependência: 20–30 mg iniciais (máx. 40 mg no 1º dia)."),
    ido=IDO(0.5, "Acúmulo; prolonga o QT."))

P["risperidona"] = dict(neo=NR("Não se aplica."), lac=NR("Não estabelecido."),
    cri=B(0.25, 0.5, 3, "mg/dia", (12, 24), 3, "Irritabilidade no autismo ≥ 5 anos: < 20 kg 0,25 mg/dia; ≥ 20 kg 0,5 mg/dia, titular (máx. 3 mg/dia)."),
    adl=B(0.5, 1.5, 2.5, "mg/dia", (12, 24), 6, "Esquizofrenia/bipolar (≥ 10–13 anos): 0,5 mg/dia → 1–2,5 mg/dia; máx. 6 mg/dia."),
    adu=B(2, 4, 6, "mg/dia", (12, 24), 16, "2 mg/dia → 4–6 mg/dia (máx. 16 mg/dia)."),
    ido=B(1, 2, 4, "mg/dia", (12,), 4, "0,5 mg 12/12 h; máx. 2 mg 12/12 h; risco aumentado na demência."))
