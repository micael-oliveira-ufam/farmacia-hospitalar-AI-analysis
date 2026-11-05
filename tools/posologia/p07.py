from dsl import B, NR, IDO, DESC
P = {}

_tb = "1–2 gotas a cada 4 h; infecção grave: 2 gotas de hora em hora até melhorar, depois espaçar."
P["tobramicina_oftalmica"] = dict(neo=DESC("Uso sob especialista."), lac=DESC(_tb), cri=DESC(_tb), adl=DESC(_tb), adu=DESC(_tb), ido=DESC(_tb))

P["tropicamida"] = dict(neo=DESC("Preferir 0,5%; 1 gota, com oclusão do ponto lacrimal."),
    lac=DESC("1 gota (preferir 0,5%); repetir em 5 min se necessário."), cri=DESC("1 gota; repetir em 5 min se necessário."),
    adl=DESC("1–2 gotas; repetir em 5 min se necessário."), adu=DESC("1–2 gotas; repetir em 5 min se necessário."),
    ido=DESC("1–2 gotas; risco de glaucoma agudo de ângulo fechado."))

_cp = "1–2 gotas a cada 2 h acordado nos 2 primeiros dias, depois 1–2 gotas a cada 4 h por 5 dias."
P["ciprofloxacino_oftalmico"] = dict(neo=NR("Não recomendado."), lac=DESC("≥ 1 ano: " + _cp + " Em < 1 ano, não estabelecido."),
    cri=DESC(_cp), adl=DESC(_cp), adu=DESC(_cp), ido=DESC(_cp))

_ad = "Somente para reconstituir/diluir; não administrar isoladamente por via EV (hemólise)."
P["agua_destilada"] = dict(neo=DESC(_ad), lac=DESC(_ad), cri=DESC(_ad), adl=DESC(_ad), adu=DESC(_ad), ido=DESC(_ad))

_k10 = lambda n: B(0.5, 0.5, 1, "mEq/kg", None, None, n, cap=40)
P["cloreto_potassio_10"] = dict(
    neo=B(0.5, 0.5, 1, "mEq/kg", None, None, "Diluir e infundir em ≥ 1–2 h (≤ 0,5 mEq/kg/h); guiar pelo K⁺ sérico. NUNCA em bolus."),
    lac=_k10("0,5–1 mEq/kg/dose diluído, infusão ≤ 0,5 mEq/kg/h; guiar pelo K⁺. NUNCA em bolus."),
    cri=_k10("0,5–1 mEq/kg/dose diluído, infusão ≤ 0,5 mEq/kg/h; guiar pelo K⁺. NUNCA em bolus."),
    adl=_k10("0,5–1 mEq/kg/dose diluído (máx. 40 mEq), infusão ≤ 0,5 mEq/kg/h. NUNCA em bolus."),
    adu=B(10, 20, 40, "mEq", None, None, "Reposição: 10–20 mEq por infusão (≤ 10 mEq/h periférico; até 20 mEq/h central com monitorização); 40–100 mEq/dia. NUNCA em bolus.", capd=100),
    ido=IDO(0.5, "Hiperpotassemia na insuficiência renal e com IECA/BRA/espironolactona; monitorar K⁺."))

_na = "Aditivo para correção de sódio: mEq a repor = (Na desejado − Na atual) × água corporal (0,6 crianças/homens; 0,5 mulheres; 0,45 idosas) × kg. 1 mL de NaCl 10% = 1,7 mEq. Diluir; elevar o Na⁺ em no máximo 8–10 mEq/L em 24 h."
P["cloreto_sodio_10"] = dict(neo=DESC(_na), lac=DESC(_na), cri=DESC(_na), adl=DESC(_na), adu=DESC(_na), ido=DESC(_na))

_gc = B(50, 60, 100, "mg/kg", None, None, "50–100 mg/kg/dose lento, com monitorização (hiperpotassemia/PCR: 60 mg/kg).", cap=3000)
P["gliconato_calcio"] = dict(
    neo=B(100, 100, 200, "mg/kg", None, None, "Hipocalcemia: 100–200 mg/kg (1–2 mL/kg) em 10–30 min com monitorização."),
    lac=_gc, cri=_gc, adl=_gc,
    adu=B(1000, 2000, 3000, "mg", None, None, "1–3 g em 10 min (hiperpotassemia: 3 g, repetir se necessário)."),
    ido=IDO(1, "Cautela com digoxina."))

_gl = lambda n: B(0.5, 0.5, 1, "g/kg", None, None, n, cap=25)
P["glicose_50"] = dict(
    neo=B(0.2, 0.2, 0.2, "g/kg", None, None, "Hipoglicemia: glicose 10% 2 mL/kg. NÃO usar glicose 50% em neonatos."),
    lac=_gl("Hipoglicemia: 0,5–1 g/kg como glicose 10% 5–10 mL/kg. Não administrar 50% sem diluição."),
    cri=_gl("Hipoglicemia: 0,5–1 g/kg (glicose 25% 2–4 mL/kg ou 10% 5–10 mL/kg)."),
    adl=_gl("Hipoglicemia: 0,5–1 g/kg (máx. 25 g)."),
    adu=B(25, 25, 25, "g", None, None, "25 g (50 mL de glicose 50%); repetir conforme glicemia."),
    ido=IDO(1, "Sem ajuste."))

_mg = B(25, 50, 50, "mg/kg", (4, 6), 200, "Asma grave: 25–50 mg/kg em 20 min; hipomagnesemia/torsades: 25–50 mg/kg; infundir lentamente.", cap=2000)
P["sulfato_magnesio"] = dict(
    neo=B(25, 37.5, 50, "mg/kg", (8, 12), None, "Hipomagnesemia: 25–50 mg/kg a cada 8–12 h."),
    lac=_mg, cri=_mg, adl=_mg,
    adu=B(2000, 4000, 4000, "mg", None, None, "Asma: 2 g. Pré-eclâmpsia (Zuspan): 4 g EV em 20 min + 1 g/h por 24 h; Pritchard: 4 g EV + 10 g IM, depois 5 g IM a cada 4 h. Vigiar reflexos, diurese e FR."),
    ido=IDO(0.5, "Ajustar na insuficiência renal."))

_man = lambda n: B(0.25, 0.5, 1, "g/kg", (4, 6), None, n)
P["manitol"] = dict(neo=NR("Uso restrito, sob especialista."),
    lac=_man("Hipertensão intracraniana: 0,25–1 g/kg a cada 4–6 h; manter osmolaridade < 320 mOsm/kg."),
    cri=_man("Hipertensão intracraniana: 0,25–1 g/kg a cada 4–6 h; manter osmolaridade < 320 mOsm/kg."),
    adl=_man("0,25–1 g/kg a cada 4–6 h; osmolaridade < 320 mOsm/kg (máx. 2 g/kg/dose)."),
    adu=_man("0,25–1 g/kg a cada 4–6 h (máx. 2 g/kg/dose); osmolaridade < 320 mOsm/kg."),
    ido=IDO(1, "Sobrecarga de volume e lesão renal."))

_ct = "Dose definida pelo radiologista conforme exame, região e peso."
P["contraste_nao_ionico"] = dict(neo=DESC(_ct), lac=DESC(_ct), cri=DESC(_ct), adl=DESC(_ct), adu=DESC(_ct), ido=DESC(_ct + " Atenção à função renal."))
P["contraste_meglumina"] = dict(neo=DESC(_ct), lac=DESC(_ct), cri=DESC(_ct), adl=DESC(_ct), adu=DESC(_ct), ido=DESC(_ct + " Atenção à função renal."))

P["sulfato_bario"] = dict(neo=DESC("Volume conforme exame (em geral 30–60 mL)."), lac=DESC("Volume conforme idade e exame."), cri=DESC("Volume conforme idade e exame."),
    adl=DESC("Volume conforme exame."), adu=DESC("150–300 mL, conforme exame."), ido=DESC("Conforme exame; risco de impactação fecal: hidratar."))

_ab = B(0.5, 1, 1, "mg/kg", (24,), 1.5, "0,5–1 mg/kg 1×/dia (iniciar 0,1–0,25 mg/kg); infundir em 4–6 h, protegido da luz; leishmaniose visceral: 1 mg/kg/dia (máx. 50 mg/dia).")
P["anfotericina_b"] = dict(
    neo=B(0.5, 1, 1, "mg/kg", (24,), 1.5, "Candidíase: 1 mg/kg 1×/dia; infundir em 4–6 h."),
    lac=_ab, cri=_ab, adl=_ab,
    adu=B(0.5, 1, 1.5, "mg/kg", (24,), 1.5, "0,5–1 mg/kg 1×/dia (até 1,5 mg/kg/dia); LV: 1 mg/kg/dia (máx. 50 mg/dia); monitorar função renal e K⁺."),
    ido=IDO(1, "Nefrotoxicidade; hidratar com SF antes da dose."))

P["atracurio"] = dict(
    neo=B(0.3, 0.35, 0.4, "mg/kg", None, None, "0,3–0,4 mg/kg (dados limitados)."),
    lac=B(0.3, 0.35, 0.4, "mg/kg", None, None, "1 mês–2 anos: 0,3–0,4 mg/kg; manutenção 0,08–0,1 mg/kg a cada 15–25 min; infusão 5–10 mcg/kg/min."),
    cri=B(0.4, 0.45, 0.5, "mg/kg", None, None, "> 2 anos: 0,4–0,5 mg/kg; manutenção 0,08–0,1 mg/kg; infusão 5–10 mcg/kg/min."),
    adl=B(0.4, 0.45, 0.5, "mg/kg", None, None, "0,4–0,5 mg/kg; manutenção 0,08–0,1 mg/kg; infusão 5–9 mcg/kg/min."),
    adu=B(0.4, 0.45, 0.5, "mg/kg", None, None, "0,4–0,5 mg/kg; manutenção 0,08–0,1 mg/kg; infusão 5–9 mcg/kg/min."),
    ido=IDO(1, "Sem ajuste (eliminação de Hofmann)."))

P["insulina_regular"] = dict(
    neo=B(0.01, 0.05, 0.1, "UI/kg/h", None, None, "Hiperglicemia: 0,01–0,1 UI/kg/h EV."),
    lac=B(0.05, 0.1, 0.1, "UI/kg/h", None, None, "CAD: 0,05–0,1 UI/kg/h EV, sem bolo, 1–2 h após o início da hidratação. SC: dose total 0,5–1 UI/kg/dia."),
    cri=B(0.05, 0.1, 0.1, "UI/kg/h", None, None, "CAD: 0,05–0,1 UI/kg/h EV, sem bolo, 1–2 h após o início da hidratação. SC: dose total 0,5–1 UI/kg/dia."),
    adl=B(0.05, 0.1, 0.1, "UI/kg/h", None, None, "CAD: 0,05–0,1 UI/kg/h EV, sem bolo."),
    adu=B(0.1, 0.1, 0.14, "UI/kg/h", None, None, "CAD: 0,1 UI/kg/h (0,14 UI/kg/h sem bolo). Hiperpotassemia: 10 UI EV + 25 g de glicose."),
    ido=IDO(0.75, "Maior risco de hipoglicemia."))

P["insulina_nph"] = dict(neo=NR("Não usar."),
    lac=B(0.5, 0.75, 1, "UI/kg/dia", (12, 24), 1, "Dose total diária 0,5–1 UI/kg, ~40–50% como basal; individualizar."),
    cri=B(0.5, 0.75, 1, "UI/kg/dia", (12, 24), 1, "Dose total diária 0,5–1 UI/kg, ~40–50% como basal; individualizar."),
    adl=B(0.5, 0.9, 1.5, "UI/kg/dia", (12, 24), 1.5, "Dose total diária 0,5–1 UI/kg (puberdade até 1,5); individualizar."),
    adu=B(0.1, 0.2, 1, "UI/kg/dia", (12, 24), None, "DM2: 10 UI ou 0,1–0,2 UI/kg/dia ao deitar. DM1: 0,4–1 UI/kg/dia (total)."),
    ido=IDO(0.5, "Maior risco de hipoglicemia; metas glicêmicas menos rígidas."))

P["pancuronio"] = dict(
    neo=B(0.1, 0.1, 0.1, "mg/kg", None, None, "0,1 mg/kg; manutenção 0,05–0,1 mg/kg a cada 0,5–4 h."),
    lac=B(0.06, 0.08, 0.1, "mg/kg", None, None, "0,06–0,1 mg/kg; manutenção 0,01–0,02 mg/kg a cada 30–60 min."),
    cri=B(0.06, 0.08, 0.1, "mg/kg", None, None, "0,06–0,1 mg/kg; manutenção 0,01–0,02 mg/kg a cada 30–60 min."),
    adl=B(0.06, 0.08, 0.1, "mg/kg", None, None, "0,06–0,1 mg/kg; manutenção 0,01–0,02 mg/kg a cada 30–60 min."),
    adu=B(0.06, 0.08, 0.1, "mg/kg", None, None, "0,06–0,1 mg/kg; manutenção 0,01 mg/kg a cada 25–60 min."),
    ido=IDO(1, "Eliminação renal prolongada."))

_ro = B(0.6, 0.6, 1.2, "mg/kg", None, None, "0,6 mg/kg (sequência rápida 1–1,2 mg/kg); manutenção 0,075–0,125 mg/kg; infusão 7–12 mcg/kg/min.")
P["rocuronio"] = dict(neo=B(0.45, 0.5, 0.6, "mg/kg", None, None, "0,45–0,6 mg/kg."), lac=_ro, cri=_ro, adl=_ro,
    adu=B(0.6, 0.6, 1.2, "mg/kg", None, None, "0,6 mg/kg (sequência rápida 1–1,2 mg/kg); manutenção 0,1–0,2 mg/kg."),
    ido=IDO(1, "Duração prolongada."))

P["glicerina_supositorio"] = dict(neo=NR("Não recomendado sem prescrição especializada."),
    lac=DESC("1 supositório infantil via retal, 1×/dia se necessário (conforme apresentação)."),
    cri=DESC("1 supositório infantil via retal, 1×/dia se necessário (conforme apresentação)."),
    adl=DESC("1 supositório via retal, repetir se necessário."), adu=DESC("1 supositório adulto via retal; repetir se necessário (até 1–2×/dia)."),
    ido=DESC("1 supositório adulto via retal; atenção a desidratação e distúrbios hidroeletrolíticos."))

_al = B(3, 4, 5, "mg/kg", (24,), 10, "3–5 mg/kg 1×/dia; leishmaniose visceral: 3 mg/kg/dia por 7 dias ou 4 mg/kg/dia por 5 dias; mucormicose: até 10 mg/kg/dia.")
P["anfotericina_lipossomal"] = dict(
    neo=B(3, 5, 5, "mg/kg", (24,), 7, "3–5 mg/kg 1×/dia (neonato: 5 mg/kg/dia)."),
    lac=_al, cri=_al, adl=_al,
    adu=B(3, 5, 10, "mg/kg", (24,), 10, "3–5 mg/kg 1×/dia (criptococose 3–6; mucormicose 5–10). LV: como em pediatria."),
    ido=IDO(1, "Monitorar função renal e K⁺."))

P["caspofungina"] = dict(
    neo=B(25, 25, 25, "mg/m2", (24,), None, "< 3 meses: 25 mg/m² 1×/dia."),
    lac=B(25, 50, 70, "mg/m2", (24,), None, "< 3 meses: 25 mg/m²/dia; ≥ 3 meses: 70 mg/m² no D1 (máx. 70 mg), depois 50 mg/m²/dia (máx. 70 mg).", cap=70),
    cri=B(50, 50, 70, "mg/m2", (24,), None, "70 mg/m² no D1 (máx. 70 mg), depois 50 mg/m²/dia (máx. 70 mg); infundir em 1 h.", cap=70),
    adl=B(50, 50, 70, "mg/m2", (24,), None, "70 mg/m² no D1 (máx. 70 mg), depois 50 mg/m²/dia (máx. 70 mg).", cap=70),
    adu=B(35, 50, 70, "mg", (24,), 70, "70 mg no D1, depois 50 mg/dia (≥ 80 kg: 70 mg/dia); hepatopatia moderada: 35 mg/dia."),
    ido=IDO(1, "Hepatopatia moderada: 35 mg/dia."))
