from dsl import B, NR, IDO, DESC
from p06 import P as P6
from p08 import P as P8
P = {}

_tp = B(1, 5, 9, "mg/kg/dia", (12, 24), 9, "≥ 2 anos: iniciar 1–3 mg/kg/dia (máx. 25 mg) à noite, aumentar a cada 1–2 semanas até 5–9 mg/kg/dia ÷ 2.", capd=400)
P["topiramato"] = dict(neo=NR("Não estabelecido."), lac=NR("Não estabelecido em < 2 anos."), cri=_tp, adl=_tp,
    adu=B(25, 100, 200, "mg", (12,), 400, "Iniciar 25–50 mg/dia; manutenção 200–400 mg/dia ÷ 2; enxaqueca: 50 mg 12/12 h."),
    ido=IDO(0.5, "Ajustar pelo ClCr."))

_ctx = B(33, 50, 100, "mg/kg", (6, 8), 300, "100–300 mg/kg/dia ÷ 6–8 h; meningite: 300 mg/kg/dia ÷ 6 h (máx. 2 g/dose; 4 g na meningite; 12 g/dia).", cap=4000, capd=12000)
P["cefotaxima"] = dict(
    neo=B(50, 50, 50, "mg/kg", (8, 12), 150, "Neonato: 50 mg/kg a cada 8–12 h conforme idade gestacional/pós-natal."),
    lac=_ctx, cri=_ctx, adl=_ctx,
    adu=B(1000, 2000, 2000, "mg", (4, 6, 8, 12), 12000, "1–2 g a cada 8–12 h; infecção grave: 2 g a cada 6–8 h; meningite: 2 g a cada 4–6 h (máx. 12 g/dia)."),
    ido=IDO(1, "Ajustar pelo ClCr."))

_cfz = B(25, 33, 50, "mg/kg", (8,), 150, "25–50 mg/kg/dose a cada 8 h; fibrose cística/infecção grave: 50 mg/kg 8/8 h (máx. 2 g/dose; 6 g/dia).", cap=2000, capd=6000)
P["ceftazidima"] = dict(
    neo=B(25, 30, 50, "mg/kg", (8, 12), 150, "Neonato: 25–50 mg/kg a cada 8–12 h conforme idade."),
    lac=_cfz, cri=_cfz, adl=_cfz,
    adu=B(1000, 2000, 2000, "mg", (8,), 6000, "1–2 g a cada 8 h (até 6 g/dia)."),
    ido=IDO(1, "Ajustar pelo ClCr."))

_cfx = B(20, 33, 50, "mg/kg", (6, 8), 150, "75–150 mg/kg/dia ÷ 6–8 h EV (máx. 3 g/dia); oral: 30 mg/kg/dia ÷ 12 h (máx. 1 g/dia).", capd=3000)
P["cefuroxima"] = dict(
    neo=B(25, 30, 50, "mg/kg", (8, 12), 150, "Neonato: 25–50 mg/kg a cada 8–12 h conforme idade."),
    lac=_cfx, cri=_cfx, adl=_cfx,
    adu=B(750, 750, 1500, "mg", (8,), 4500, "750 mg a cada 8 h; infecção grave: 1,5 g a cada 8 h; meningite: 3 g 8/8 h."),
    ido=IDO(1, "Ajustar pelo ClCr."))

_nit = B(1, 1.5, 1.75, "mg/kg", (6,), 7, "ITU: 4–7 mg/kg/dia ÷ 4 doses; profilaxia: 1–2 mg/kg/dia em dose única noturna (máx. 100 mg). Não usar com TFG < 30.", capd=400)
P["nitrofurantoina"] = dict(neo=NR("Contraindicada em < 1 mês (anemia hemolítica)."), lac=_nit, cri=_nit, adl=_nit,
    adu=B(50, 100, 100, "mg", (6, 12), 400, "100 mg a cada 6 h (ou 12/12 h) por 5–7 dias; evitar com ClCr < 30."),
    ido=IDO(1, "Evitar com ClCr < 30; risco de neuropatia e toxicidade pulmonar em uso prolongado."))

P["levofloxacino"] = dict(neo=NR("Não recomendado."),
    lac=B(8, 10, 10, "mg/kg", (12,), 20, "6 meses–5 anos: 8–10 mg/kg a cada 12 h (máx. 750 mg/dia); < 6 meses: não estabelecido. Reservar para infecções sem alternativa (artropatia).", capd=750),
    cri=B(8, 10, 10, "mg/kg", (12, 24), 20, "< 5 anos: 8–10 mg/kg 12/12 h; ≥ 5 anos: 8–10 mg/kg 1×/dia (máx. 750 mg/dia). Reservar para infecções sem alternativa.", cap=750, capd=750),
    adl=B(500, 500, 750, "mg", (24,), 750, "500–750 mg 1×/dia; reservar para infecções sem alternativa."),
    adu=B(500, 500, 750, "mg", (24,), 750, "500 mg 1×/dia (750 mg em infecção grave/pneumonia)."),
    ido=IDO(1, "Ajustar pelo ClCr; risco de tendinopatia, QT longo e delirium."))

_imi = B(15, 20, 25, "mg/kg", (6, 8), 100, "1–3 meses: 20 mg/kg 8/8 h; ≥ 3 meses: 15–25 mg/kg 6/6 h (máx. 500 mg/dose; 4 g/dia).", cap=500, capd=4000)
P["imipenem_cilastatin"] = dict(
    neo=B(20, 20, 25, "mg/kg", (8, 12), 75, "Neonato: 20–25 mg/kg a cada 8–12 h conforme idade (risco de convulsões)."),
    lac=_imi, cri=_imi, adl=_imi,
    adu=B(500, 500, 1000, "mg", (6, 8), 4000, "500 mg a cada 6 h (1 g 8/8 h em infecção grave/Pseudomonas); máx. 4 g/dia."),
    ido=IDO(1, "Ajustar pelo ClCr; risco de convulsão."))

_vo = "Experiência limitada em < 2 anos: decisão do especialista, guiada por nível sérico."
P["voriconazol"] = dict(neo=NR(_vo), lac=NR(_vo),
    cri=B(8, 8, 9, "mg/kg", (12,), 18, "EV: ataque 9 mg/kg 12/12 h × 2 doses (máx. 400 mg/dose), manutenção 8 mg/kg 12/12 h (máx. 350 mg); oral > 15 kg: 9 mg/kg 12/12 h; monitorar nível sérico.", cap=400, capd=700),
    adl=B(4, 4, 8, "mg/kg", (12,), None, "12–14 anos < 50 kg: como crianças; ≥ 15 anos ou ≥ 50 kg: ataque 6 mg/kg 12/12 h × 2, manutenção 4 mg/kg 12/12 h (ou 200–300 mg VO 12/12 h).", cap=400),
    adu=B(4, 4, 6, "mg/kg", (12,), None, "Ataque 6 mg/kg 12/12 h × 2 doses, manutenção 4 mg/kg 12/12 h EV; oral: 200 mg 12/12 h (≥ 40 kg), até 300 mg; monitorar nível sérico."),
    ido=IDO(1, "Interações (CYP) e hepatotoxicidade; guiar por nível sérico."))

_gc = B(5, 5, 7.5, "mg/kg", (12, 24), 15, "Indução: 5 mg/kg 12/12 h × 14–21 dias; manutenção/profilaxia: 5 mg/kg 1×/dia; infundir em 1 h; monitorar hemograma.", capd=1000)
P["ganciclovir"] = dict(
    neo=B(5, 6, 6, "mg/kg", (12,), 12, "CMV congênito: 6 mg/kg 12/12 h por 6 semanas; monitorar neutropenia."),
    lac=_gc, cri=_gc, adl=_gc,
    adu=B(5, 5, 5, "mg/kg", (12, 24), 10, "Indução: 5 mg/kg 12/12 h por 14–21 dias; manutenção: 5 mg/kg 1×/dia; ajustar pelo ClCr."),
    ido=IDO(1, "Ajustar pelo ClCr; neutropenia."))

P["dexametasona_oral"] = dict(P6["dexametasona_elixir"])

_cpo = B(10, 15, 20, "mg/kg", (12,), 40, "10–20 mg/kg/dose 12/12 h VO (máx. 750 mg/dose; 1.500 mg/dia). Reservar para infecções sem alternativa (artropatia).", cap=750, capd=1500)
P["ciprofloxacino_oral"] = dict(neo=NR("Não recomendado."), lac=_cpo, cri=_cpo, adl=_cpo,
    adu=B(250, 500, 750, "mg", (12,), 1500, "250–750 mg 12/12 h; máx. 1,5 g/dia."),
    ido=IDO(0.75, "Ajustar pelo ClCr; risco de tendinopatia, delirium e QT longo."))

P["linezolida_oral"] = dict(P8["linezolida"])

_az = B(30, 40, 50, "mg/kg", (6, 8), 200, "30–50 mg/kg/dose a cada 6–8 h; fibrose cística/infecção grave: 50 mg/kg 6/6 h (máx. 2 g/dose; 8 g/dia).", cap=2000, capd=8000)
P["aztreonam"] = dict(
    neo=B(30, 30, 30, "mg/kg", (8, 12), 90, "Neonato: 30 mg/kg a cada 8–12 h conforme idade."),
    lac=_az, cri=_az, adl=_az,
    adu=B(1000, 1000, 2000, "mg", (6, 8, 12), 8000, "1–2 g a cada 8–12 h; infecção grave: 2 g a cada 6–8 h (máx. 8 g/dia)."),
    ido=IDO(1, "Ajustar pelo ClCr."))

_ctm = B(4, 5, 6, "mg/kg", (12,), 12, "Dose em trimetoprima (TMP): 4–6 mg/kg 12/12 h; pneumocistose: 15–20 mg/kg/dia ÷ 6–8 h.", cap=160, capd=960)
P["cotrimoxazol_oral"] = dict(neo=NR("Contraindicado em < 2 meses (kernicterus)."), lac=_ctm, cri=_ctm, adl=_ctm,
    adu=B(4, 5, 5, "mg/kg", (8, 12), 20, "Dose em TMP: 8–10 mg/kg/dia ÷ 8–12 h; ITU: 160 mg (1 cp 160/800) 12/12 h; pneumocistose: 15–20 mg/kg/dia ÷ 6–8 h."),
    ido=IDO(1, "Ajustar pelo ClCr; hiperpotassemia."),
    nota="Dose por dose = componente trimetoprima.")

_dic = B(1, 1, 1.5, "mg/kg", (8,), 4.5, "≥ 6 meses: 1–1,5 mg/kg/dose 8/8 h VO/retal (máx. 50 mg/dose; 150 mg/dia). Cautela em nefropatia, desidratação e doença gastrointestinal.", cap=50, capd=150)
P["diclofenaco"] = dict(neo=NR("Não recomendado."), lac=_dic, cri=_dic, adl=_dic,
    adu=B(50, 50, 50, "mg", (8, 12), 150, "50 mg a cada 8–12 h (máx. 150 mg/dia)."),
    ido=IDO(0.5, "Risco renal, gastrointestinal e cardiovascular; menor dose pelo menor tempo."))

_ade = B(0.1, 0.1, 0.3, "mg/kg", None, None, "TSV: 0,1 mg/kg em bolus rápido + flush de SF (máx. 6 mg); repetir 0,2 mg/kg (máx. 12 mg); acesso venoso próximo ao coração.", cap=12)
P["adenosina"] = dict(
    neo=B(0.05, 0.1, 0.25, "mg/kg", None, None, "TSV: 0,05–0,1 mg/kg em bolus rápido + flush; repetir aumentando 0,05 mg/kg."),
    lac=_ade, cri=_ade, adl=_ade,
    adu=B(6, 6, 12, "mg", None, None, "6 mg em bolus rápido + flush; repetir 12 mg se sem resposta (até 2 vezes)."),
    ido=IDO(1, "Sem ajuste; monitorizar ECG."))

_am = B(5, 5, 5, "mg/kg", None, None, "FV/TV sem pulso: 5 mg/kg EV em bolus (máx. 300 mg), repetir até 3×; com pulso: 5 mg/kg em 20–60 min; monitorar QT, PA e tireoide.", cap=300)
P["amiodarona"] = dict(
    neo=B(5, 5, 5, "mg/kg", None, None, "Dados limitados: 5 mg/kg em 30–60 min, sob especialista."),
    lac=_am, cri=_am, adl=_am,
    adu=B(150, 300, 300, "mg", None, None, "PCR (FV/TV): 300 mg em bolus, repetir 150 mg; TV com pulso: 150 mg em 10 min, depois 1 mg/min por 6 h e 0,5 mg/min por 18 h."),
    ido=IDO(1, "Monitorar QT, PA e tireoide."))

_pi = B(7.5, 10, 15, "mg/kg", (6,), 60, "< 10 kg: 7,5 mg/kg 6/6 h (máx. 30 mg/kg/dia); ≥ 10 kg: 15 mg/kg 6/6 h (máx. 60 mg/kg/dia ou 4 g); infundir em 15 min; usar apenas se VO não for possível.", cap=1000, capd=4000)
P["paracetamol_inj"] = dict(
    pre=B(7.5, 7.5, 7.5, "mg/kg", (6,), 30, "Prematuro > 32 sem: 7,5 mg/kg a cada 6 h (máx. 30 mg/kg/dia)."),
    neo=B(7.5, 7.5, 7.5, "mg/kg", (6,), 30, "7,5 mg/kg a cada 6 h (máx. 30 mg/kg/dia)."),
    lac=_pi, cri=_pi, adl=_pi,
    adu=B(500, 1000, 1000, "mg", (4, 6), 4000, "1 g a cada 6 h (≥ 50 kg); máx. 4 g/dia; infundir em 15 min."),
    ido=IDO(1, "Considerar máx. 3 g/dia na hepatopatia ou desnutrição."))
