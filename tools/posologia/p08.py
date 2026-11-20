from dsl import B, NR, IDO, DESC
P = {}

_lz = B(10, 10, 10, "mg/kg", (8,), 30, "< 12 anos: 10 mg/kg 8/8 h; monitorar hemograma; risco serotoninérgico.", cap=600, capd=1200)
P["linezolida"] = dict(
    pre=B(10, 10, 10, "mg/kg", (8, 12), 30, "< 7 dias e < 34 sem: 10 mg/kg 12/12 h; depois 10 mg/kg 8/8 h."),
    neo=B(10, 10, 10, "mg/kg", (8, 12), 30, "< 7 dias e < 34 sem: 10 mg/kg 12/12 h; depois 10 mg/kg 8/8 h."),
    lac=_lz, cri=_lz,
    adl=B(600, 600, 600, "mg", (12,), 1200, "≥ 12 anos: 600 mg 12/12 h."),
    adu=B(600, 600, 600, "mg", (12,), 1200, "600 mg 12/12 h."),
    ido=IDO(1, "Mielossupressão com uso > 14 dias; monitorar hemograma."))

P["micafungina"] = dict(
    neo=B(4, 7, 10, "mg/kg", (24,), 10, "< 4 meses: 4–10 mg/kg 1×/dia (10 mg/kg se SNC)."),
    lac=B(2, 2, 10, "mg/kg", (24,), 10, "< 4 meses: 4–10 mg/kg 1×/dia (10 se SNC); ≥ 4 meses: 2 mg/kg/dia (até 4)."),
    cri=B(1, 2, 4, "mg/kg", (24,), 4, "≤ 40 kg: 2 mg/kg/dia (até 4); profilaxia: 1 mg/kg/dia; > 40 kg: 100 mg/dia (até 200).", cap=200),
    adl=B(50, 100, 200, "mg", (24,), 200, "> 40 kg: 100 mg/dia (até 200); profilaxia 50 mg/dia."),
    adu=B(50, 100, 200, "mg", (24,), 200, "Candidemia: 100 mg/dia (até 200); esofágica: 150 mg/dia; profilaxia: 50 mg/dia."),
    ido=IDO(1, "Sem ajuste."))

_pb = B(15000, 20000, 25000, "UI/kg/dia", (12,), 40000, "15.000–25.000 UI/kg/dia ÷ 12/12 h (lactentes até 40.000); monitorar função renal.")
P["polimixina_b"] = dict(
    neo=B(15000, 25000, 40000, "UI/kg/dia", (12,), 40000, "Até 40.000 UI/kg/dia ÷ 12/12 h (bula)."),
    lac=B(15000, 25000, 40000, "UI/kg/dia", (12,), 40000, "15.000–25.000 UI/kg/dia (lactentes até 40.000) ÷ 12/12 h."),
    cri=_pb, adl=_pb,
    adu=B(12500, 12500, 15000, "UI/kg", (12,), 30000, "Ataque 20.000–25.000 UI/kg em 2 h; manutenção 12.500–15.000 UI/kg 12/12 h (peso total, sem ajuste renal)."),
    ido=IDO(1, "Nefro e neurotoxicidade."))

P["teicoplanina"] = dict(
    neo=B(8, 8, 16, "mg/kg", (24,), None, "≤ 2 meses: ataque de 16 mg/kg, depois 8 mg/kg 1×/dia (infusão de 30 min)."),
    lac=B(6, 10, 10, "mg/kg", (12, 24), None, "≥ 2 meses: 10 mg/kg 12/12 h × 3 doses, depois 6–10 mg/kg/dia."),
    cri=B(6, 10, 10, "mg/kg", (12, 24), None, "10 mg/kg 12/12 h × 3 doses, depois 6–10 mg/kg/dia."),
    adl=B(6, 10, 12, "mg/kg", (12, 24), None, "Ataque 10–12 mg/kg 12/12 h × 3 doses, depois 6–12 mg/kg/dia."),
    adu=B(6, 6, 12, "mg/kg", (12, 24), None, "Ataque 6–12 mg/kg 12/12 h × 3–5 doses; manutenção 6–12 mg/kg/dia; vale 15–30 mg/L."),
    ido=IDO(1, "Ajustar a partir do 4º dia pelo ClCr."))

P["tigeciclina"] = dict(neo=NR("Contraindicada."), lac=NR("< 8 anos: não usar."),
    cri=B(1.2, 1.2, 1.2, "mg/kg", (12,), None, "8–11 anos: 1,2 mg/kg 12/12 h (máx. 50 mg/dose); < 8 anos: não usar.", cap=50),
    adl=B(50, 50, 50, "mg", (12,), 100, "12–17 anos: 50 mg 12/12 h."),
    adu=B(50, 50, 100, "mg", (12,), 200, "Ataque 100 mg, depois 50 mg 12/12 h (100 mg 12/12 h em dose alta, off-label)."),
    ido=IDO(1, "Hepatopatia grave: 25 mg 12/12 h."))

P["clorpromazina"] = dict(neo=NR("Não recomendado."),
    lac=B(0.5, 0.5, 1, "mg/kg", (6, 8), None, "≥ 6 meses: 0,5–1 mg/kg/dose a cada 6–8 h (máx. 40 mg/dia se < 5 anos ou < 23 kg).", capd=40),
    cri=B(0.5, 0.5, 1, "mg/kg", (6, 8), None, "0,5–1 mg/kg/dose a cada 6–8 h (máx. 40 mg/dia se < 23 kg; 75 mg/dia em 5–12 anos).", capd=75),
    adl=B(0.5, 0.5, 1, "mg/kg", (6, 8), None, "0,5–1 mg/kg/dose a cada 6–8 h; dose habitual do adulto.", cap=50),
    adu=B(25, 25, 50, "mg", (4, 6), 400, "25–50 mg IM, repetir a cada 4–6 h conforme necessidade (máx. 400 mg/dia)."),
    ido=IDO(0.5, "Hipotensão e quedas; evitar na demência."))

P["dexmedetomidina"] = dict(
    neo=B(0.05, 0.2, 0.3, "mcg/kg/h", None, None, "Off-label (≥ 28 sem): 0,05–0,3 mcg/kg/h, sem dose de ataque."),
    lac=B(0.2, 0.5, 1, "mcg/kg/h", None, None, "Off-label: ataque 0,5–1 mcg/kg em 10 min (opcional); infusão 0,2–1 mcg/kg/h; intranasal 2–3 mcg/kg."),
    cri=B(0.2, 0.5, 1, "mcg/kg/h", None, None, "Off-label: ataque 0,5–1 mcg/kg em 10 min (opcional); infusão 0,2–1 mcg/kg/h; intranasal 2–3 mcg/kg."),
    adl=B(0.2, 0.5, 1, "mcg/kg/h", None, None, "Infusão 0,2–1 mcg/kg/h; ataque opcional 0,5–1 mcg/kg em 10 min."),
    adu=B(0.2, 0.5, 1.4, "mcg/kg/h", None, None, "UTI: 0,2–0,7 (até 1,4) mcg/kg/h; ataque opcional de 1 mcg/kg em 10 min."),
    ido=IDO(0.7, "Bradicardia e hipotensão; reduzir a dose."))

P["diazepam_inj"] = dict(neo=NR("Evitar (benzoato de sódio e álcool benzílico); preferir fenobarbital."),
    lac=B(0.15, 0.2, 0.3, "mg/kg", None, None, "Estado de mal: 0,15–0,2 mg/kg EV lento, repetir 1 vez (máx. 10 mg/dose).", cap=10),
    cri=B(0.15, 0.2, 0.5, "mg/kg", None, None, "EV: 0,15–0,2 mg/kg (máx. 10 mg), repetir 1 vez. Retal: 0,5 mg/kg (2–5 anos), 0,3 mg/kg (6–11 anos) (máx. 20 mg).", cap=10),
    adl=B(0.15, 0.2, 0.2, "mg/kg", None, None, "Estado de mal: 0,15–0,2 mg/kg (máx. 10 mg), repetir 1 vez.", cap=10),
    adu=B(2, 10, 10, "mg", None, None, "Estado de mal: 10 mg EV lento (0,15–0,2 mg/kg), repetir 1 vez (máx. 30 mg em 8 h). Ansiedade aguda: 2–10 mg.", capd=30),
    ido=IDO(0.5, "Reduzir a dose (meia-vida prolongada)."))

P["escetamina"] = dict(neo=NR("Não estabelecido."),
    lac=B(0.125, 0.5, 1, "mg/kg", None, None, "Analgesia subanestésica: 0,125–0,25 mg/kg; indução: 0,5–1 mg/kg EV ou 2–4 mg/kg IM (dados limitados em lactentes)."),
    cri=B(0.125, 0.5, 1, "mg/kg", None, None, "Analgesia subanestésica: 0,125–0,25 mg/kg; indução: 0,5–1 mg/kg EV ou 2–4 mg/kg IM."),
    adl=B(0.125, 0.5, 1, "mg/kg", None, None, "Analgesia: 0,125–0,25 mg/kg; indução: 0,5–1 mg/kg EV ou 2–4 mg/kg IM."),
    adu=B(0.125, 0.5, 1, "mg/kg", None, None, "Analgesia: 0,125–0,25 mg/kg; indução: 0,5–1 mg/kg EV (IM 2–4 mg/kg); manutenção: metade da dose inicial."),
    ido=IDO(0.5, "Reduzir; risco cardiovascular."))

P["etomidato"] = dict(neo=NR("Não estabelecido."),
    lac=B(0.3, 0.3, 0.3, "mg/kg", None, None, "Off-label (< 10 anos): 0,3 mg/kg EV."),
    cri=B(0.3, 0.3, 0.3, "mg/kg", None, None, "< 10 anos: off-label, 0,3 mg/kg EV."),
    adl=B(0.2, 0.3, 0.4, "mg/kg", None, None, "≥ 10 anos: 0,2–0,4 mg/kg EV."),
    adu=B(0.2, 0.3, 0.6, "mg/kg", None, None, "0,2–0,6 mg/kg (usual 0,3 mg/kg); máx. 60 mg.", cap=60),
    ido=IDO(0.5, "Reduzir a dose."))

_ph = lambda n: B(15, 20, 20, "mg/kg", None, None, n, cap=1500)
P["fenitoina"] = dict(
    neo=B(15, 20, 20, "mg/kg", None, None, "Ataque: 15–20 mg/kg; manutenção: 5–8 mg/kg/dia ÷ 8–12 h."),
    lac=_ph("Ataque: 20 mg/kg (≤ 1 mg/kg/min); manutenção 5–8 mg/kg/dia ÷ 8–12 h. Diluir em SF 0,9%."),
    cri=_ph("Ataque: 20 mg/kg (≤ 1 mg/kg/min; máx. 50 mg/min); manutenção 5–8 mg/kg/dia ÷ 8–12 h. Diluir em SF 0,9%."),
    adl=_ph("Ataque: 20 mg/kg (≤ 50 mg/min; máx. 1.500 mg); manutenção 5–8 mg/kg/dia ÷ 8–12 h."),
    adu=_ph("Ataque: 20 mg/kg (≤ 50 mg/min; máx. 1.500 mg); manutenção 100 mg a cada 6–8 h."),
    ido=IDO(1, "Velocidade ≤ 20–25 mg/min; monitorizar ECG."))

_fb = lambda n: B(15, 20, 20, "mg/kg", None, None, n, cap=1000)
P["fenobarbital_inj"] = dict(
    neo=B(15, 20, 20, "mg/kg", None, None, "Ataque: 20 mg/kg (repetir 10 mg/kg até 40 mg/kg no total); manutenção 3–5 mg/kg/dia."),
    lac=_fb("Ataque: 15–20 mg/kg (≤ 30 mg/min); manutenção: lactentes 5–6 mg/kg/dia."),
    cri=_fb("Ataque: 15–20 mg/kg (≤ 30 mg/min; máx. 1 g); manutenção: 1–5 anos 6–8; 5–12 anos 4–6 mg/kg/dia."),
    adl=_fb("Ataque: 15–20 mg/kg (máx. 1 g); manutenção 1–3 mg/kg/dia."),
    adu=_fb("Ataque: 15–20 mg/kg (50–100 mg/min; máx. 1 g); manutenção 1–3 mg/kg/dia."),
    ido=IDO(0.75, "Sedação prolongada; reduzir."))

P["fentanil"] = dict(
    neo=B(0.5, 1, 2, "mcg/kg", None, None, "0,5–2 mcg/kg/dose; infusão 0,5–2 mcg/kg/h (até 3)."),
    lac=B(1, 1, 2, "mcg/kg", None, None, "Analgesia: 1–2 mcg/kg a cada 30–60 min; infusão 1–3 mcg/kg/h; titular.", cap=100),
    cri=B(1, 1, 2, "mcg/kg", None, None, "Analgesia: 1–2 mcg/kg a cada 30–60 min; infusão 1–3 mcg/kg/h; titular.", cap=100),
    adl=B(1, 1, 2, "mcg/kg", None, None, "Analgesia: 1–2 mcg/kg; infusão 1–3 mcg/kg/h; titular.", cap=100),
    adu=B(25, 50, 100, "mcg", None, None, "Analgesia: 25–100 mcg (0,5–1 mcg/kg); anestesia: 2–20 mcg/kg; titular."),
    ido=IDO(0.5, "Reduzir 50%."))

P["flumazenil"] = dict(neo=NR("Dados limitados."), lac=NR("Não estabelecido em ≤ 1 ano."),
    cri=B(0.01, 0.01, 0.01, "mg/kg", None, None, "> 1 ano: 0,01 mg/kg (máx. 0,2 mg), repetir a cada 1 min (total 0,05 mg/kg ou 1 mg).", cap=0.2),
    adl=B(0.01, 0.01, 0.01, "mg/kg", None, None, "0,01 mg/kg (máx. 0,2 mg), repetir a cada 1 min (máx. 1 mg).", cap=0.2),
    adu=B(0.1, 0.2, 0.2, "mg", None, None, "0,2 mg em 15 s; depois 0,1 mg a cada 60 s; máx. 1 mg (sedação) ou 2 mg (intoxicação)."),
    ido=IDO(1, "Sem ajuste."))

P["haloperidol_inj"] = dict(neo=NR("Não recomendado."), lac=NR("Uso injetável não estabelecido."),
    cri=B(1, 2, 3, "mg", (4, 6, 8), None, "Off-label 6–12 anos: 1–3 mg IM a cada 4–8 h (máx. 0,15 mg/kg/dia); < 6 anos: não estabelecido."),
    adl=B(2, 3, 5, "mg", (1, 4, 6), 20, "Agitação: 2–5 mg IM, repetir se necessário (máx. 20 mg/dia); monitorar QT."),
    adu=B(2, 3, 5, "mg", (1, 4, 6), 20, "Agitação: 2–5 mg IM, repetir a cada 1 h se necessário (máx. 20 mg/dia); monitorar QT."),
    ido=IDO(0.25, "Delirium: 0,5–1 mg; aumento de mortalidade na demência."))

_hd = "Formulação de depósito: IM profunda a cada 4 semanas."
P["haloperidol_decanoato"] = dict(neo=NR("Não recomendado."), lac=NR("Não recomendado."), cri=NR("Uso raro em pediatria: decisão do psiquiatra."),
    adl=NR("Uso raro em adolescentes: decisão do psiquiatra."),
    adu=DESC(_hd + " Iniciar com 10–15 × a dose oral diária de haloperidol (máx. 100 mg na 1ª aplicação), só após estabilização com a forma oral; ajustar pela resposta."),
    ido=DESC(_hd + " Dose inicial reduzida; evitar na demência (aumento de mortalidade)."))

P["midazolam"] = dict(
    neo=B(0.05, 0.075, 0.1, "mg/kg", None, None, "Sedação: 0,05–0,1 mg/kg EV em 5 min; infusão 0,01–0,06 mg/kg/h."),
    lac=B(0.05, 0.1, 0.2, "mg/kg", None, None, "Sedação: 0,05–0,1 mg/kg EV; estado de mal: 0,2 mg/kg IM/intranasal/bucal; infusão 0,05–0,12 mg/kg/h.", cap=10),
    cri=B(0.05, 0.1, 0.2, "mg/kg", None, None, "Sedação: 0,05–0,1 mg/kg EV (máx. 6 mg em 6 m–5 anos; 10 mg em 6–12 anos); estado de mal: 0,2 mg/kg IM/IN/bucal (máx. 10 mg).", cap=10),
    adl=B(0.05, 0.1, 0.2, "mg/kg", None, None, "Sedação: 0,05–0,1 mg/kg EV; estado de mal: 0,2 mg/kg IM (máx. 10 mg).", cap=10),
    adu=B(1, 2.5, 10, "mg", None, None, "Sedação: 1–2,5 mg EV titulado (máx. 5 mg); estado de mal: 10 mg IM; infusão UTI: 0,02–0,1 mg/kg/h."),
    ido=IDO(0.4, "Sedação: 0,5–1 mg; máx. 3,5 mg."))

P["morfina"] = dict(
    neo=B(0.05, 0.05, 0.1, "mg/kg", (4, 6), None, "EV: 0,05–0,1 mg/kg a cada 4–6 h; infusão 0,01–0,02 mg/kg/h; cautela respiratória."),
    lac=B(0.05, 0.05, 0.1, "mg/kg", (4, 6), None, "0,05–0,1 mg/kg/dose EV/SC a cada 4–6 h (< 6 meses: menor dose); ter naloxona disponível.", cap=15),
    cri=B(0.05, 0.1, 0.2, "mg/kg", (2, 4), None, "0,05–0,2 mg/kg/dose EV/SC a cada 2–4 h (máx. 15 mg/dose).", cap=15),
    adl=B(0.05, 0.1, 0.2, "mg/kg", (2, 4), None, "0,05–0,2 mg/kg/dose EV/SC a cada 2–4 h (máx. 15 mg/dose).", cap=15),
    adu=B(2, 5, 10, "mg", (4,), None, "2–10 mg EV/SC a cada 4 h, titulado pela dor e FR (EV: 2–5 mg)."),
    ido=IDO(0.5, "Titular com doses baixas; risco de depressão respiratória e delirium."))

P["naloxona"] = dict(
    neo=B(0.01, 0.1, 0.1, "mg/kg", None, None, "Depressão por opioide: 0,1 mg/kg (não recomendada de rotina na sala de parto)."),
    lac=B(0.001, 0.1, 0.1, "mg/kg", None, None, "Reversão completa: 0,1 mg/kg, repetir a cada 2–3 min (máx. 2 mg/dose); depressão por dose terapêutica: 0,001–0,005 mg/kg.", cap=2),
    cri=B(0.001, 0.1, 0.1, "mg/kg", None, None, "Reversão completa: 0,1 mg/kg, repetir a cada 2–3 min (máx. 2 mg/dose); depressão por dose terapêutica: 0,001–0,005 mg/kg.", cap=2),
    adl=B(0.001, 0.1, 0.1, "mg/kg", None, None, "Reversão completa: 0,1 mg/kg (máx. 2 mg/dose), repetir a cada 2–3 min; dose terapêutica: 0,001–0,005 mg/kg.", cap=2),
    adu=B(0.04, 0.4, 2, "mg", None, None, "0,4–2 mg a cada 2–3 min; depressão por dose terapêutica: 0,04–0,1 mg; máx. 10 mg."),
    ido=IDO(0.5, "Titular com doses baixas (risco de abstinência e edema agudo de pulmão)."))

P["remifentanila"] = dict(
    neo=B(0.4, 0.7, 1, "mcg/kg/min", None, None, "0,4–1 mcg/kg/min (dados limitados)."),
    lac=B(0.05, 0.25, 1.3, "mcg/kg/min", None, None, "Manutenção 0,05–1,3 mcg/kg/min (usual 0,25); bolo 1 mcg/kg."),
    cri=B(0.05, 0.25, 1.3, "mcg/kg/min", None, None, "1–12 anos: manutenção 0,05–1,3 mcg/kg/min (usual 0,25); bolo 1 mcg/kg."),
    adl=B(0.05, 0.25, 1.3, "mcg/kg/min", None, None, "Manutenção 0,05–1,3 mcg/kg/min (usual 0,25)."),
    adu=B(0.05, 0.25, 2, "mcg/kg/min", None, None, "Indução: 0,5–1 mcg/kg/min; manutenção: 0,05–2 mcg/kg/min."),
    ido=IDO(0.5, "Reduzir 50%."))

P["sugamadex"] = dict(neo=NR("Não estabelecido."), lac=NR("Não estabelecido em < 2 anos."),
    cri=B(2, 2, 4, "mg/kg", None, None, "≥ 2 anos: 2 mg/kg (bloqueio moderado) ou 4 mg/kg (profundo)."),
    adl=B(2, 2, 4, "mg/kg", None, None, "2 mg/kg (bloqueio moderado) ou 4 mg/kg (profundo)."),
    adu=B(2, 4, 16, "mg/kg", None, None, "2 mg/kg (moderado); 4 mg/kg (profundo); 16 mg/kg (reversão imediata após 1,2 mg/kg de rocurônio)."),
    ido=IDO(1, "Sem ajuste."))

_tr = B(1, 1.5, 2, "mg/kg", (6, 8), 8, "Bula brasileira: ≥ 1 ano, 1–2 mg/kg/dose. FDA: contraindicado < 12 anos e pós-amigdalectomia < 18 anos.", cap=100, capd=400)
P["tramadol"] = dict(neo=NR("Contraindicado."), lac=NR("Bula brasileira: ≥ 1 ano; FDA: contraindicado < 12 anos."),
    cri=_tr, adl=_tr,
    adu=B(50, 50, 100, "mg", (4, 6), 400, "50–100 mg a cada 4–6 h (máx. 400 mg/dia)."),
    ido=IDO(0.75, "> 75 anos: máx. 300 mg/dia."))
