from dsl import B, NR, IDO
P = {}

_inf = lambda a, r, b, n: B(a, r, b, "mcg/kg/min", None, None, n)
P["dopamina"] = dict(
    neo=_inf(2, 5, 20, "Infusão contínua 2–20 mcg/kg/min; via exclusiva e bomba de infusão."),
    lac=_inf(2, 5, 20, "Infusão contínua 2–20 mcg/kg/min; no choque séptico, preferir epinefrina ou norepinefrina."),
    cri=_inf(2, 5, 20, "Infusão contínua 2–20 mcg/kg/min; no choque séptico, preferir epinefrina ou norepinefrina."),
    adl=_inf(2, 5, 20, "Infusão contínua 2–20 mcg/kg/min."),
    adu=_inf(2, 5, 20, "Infusão contínua 2–20 mcg/kg/min (até 50 em casos selecionados)."),
    ido=IDO(1, "Risco de arritmia: iniciar na menor dose."))

_enx_n = "Tratamento: 1 mg/kg 12/12 h; profilaxia: 0,5 mg/kg 12/12 h. Ajustar por anti-Xa (0,5–1 UI/mL no tratamento). Mínima = profilaxia; recomendada/máxima = tratamento."
P["enoxaparina"] = dict(
    neo=B(0.75, 1.5, 1.5, "mg/kg", (12,), None, "< 2 meses: tratamento 1,5 mg/kg 12/12 h; profilaxia 0,75 mg/kg 12/12 h. Ajustar por anti-Xa 0,5–1 UI/mL."),
    lac=B(0.5, 1, 1.5, "mg/kg", (12,), None, "< 2 meses: tratamento 1,5 mg/kg e profilaxia 0,75 mg/kg 12/12 h; ≥ 2 meses: tratamento 1 mg/kg e profilaxia 0,5 mg/kg 12/12 h. Ajustar por anti-Xa."),
    cri=B(0.5, 1, 1, "mg/kg", (12,), None, _enx_n),
    adl=B(0.5, 1, 1, "mg/kg", (12,), None, _enx_n),
    adu=B(0.5, 1, 1.5, "mg/kg", (12, 24), None, "Mínima ≈ profilaxia (40 mg SC 1×/dia; 20 mg se ClCr < 30). Recomendada: tratamento 1 mg/kg 12/12 h. Máxima: 1,5 mg/kg 1×/dia. ClCr < 30: 1 mg/kg a cada 24 h."),
    ido=IDO(1, "≥ 75 anos no IAMCSST: sem bolo, 0,75 mg/kg 12/12 h (máx. 75 mg nas 2 primeiras doses); ajustar pelo ClCr."))

P["epinefrina"] = dict(
    neo=B(0.01, 0.02, 0.03, "mg/kg", None, None, "Reanimação neonatal: 0,01–0,03 mg/kg EV/IO (solução 0,1 mg/mL); endotraqueal 0,05–0,1 mg/kg."),
    lac=B(0.01, 0.01, 0.01, "mg/kg", None, None, "PCR: 0,01 mg/kg EV/IO a cada 3–5 min (máx. 1 mg). Anafilaxia: 0,01 mg/kg IM (1 mg/mL), máx. 0,3 mg. Infusão: 0,05–1 mcg/kg/min.", cap=1),
    cri=B(0.01, 0.01, 0.01, "mg/kg", None, None, "PCR: 0,01 mg/kg EV/IO a cada 3–5 min (máx. 1 mg). Anafilaxia: 0,01 mg/kg IM, máx. 0,3 mg. Crupe: nebulização 0,5 mL/kg de 1 mg/mL (máx. 5 mL). Infusão: 0,05–1 mcg/kg/min.", cap=1),
    adl=B(0.01, 0.01, 0.01, "mg/kg", None, None, "PCR: 1 mg EV/IO a cada 3–5 min. Anafilaxia: 0,5 mg IM. Infusão: 0,05–1 mcg/kg/min.", cap=1),
    adu=B(0.5, 1, 1, "mg", None, None, "PCR: 1 mg EV a cada 3–5 min. Anafilaxia: 0,5 mg IM (repetir em 5–15 min). Infusão: 2–10 mcg/min."),
    ido=IDO(1, "Risco de isquemia miocárdica."))

P["escopolamina"] = dict(neo=NR("Não estabelecido."),
    lac=B(0.3, 0.3, 0.6, "mg/kg", (6, 8), 1.5, "Casos graves: 0,3–0,6 mg/kg/dose, várias vezes ao dia.", cap=20),
    cri=B(0.3, 0.3, 0.6, "mg/kg", (6, 8), 1.5, "Casos graves: 0,3–0,6 mg/kg/dose, várias vezes ao dia.", cap=20),
    adl=B(0.3, 0.3, 0.6, "mg/kg", (6, 8), 1.5, "Casos graves: 0,3–0,6 mg/kg/dose, várias vezes ao dia.", cap=40),
    adu=B(20, 20, 40, "mg", (4, 6, 8), 100, "20–40 mg/dose, várias vezes ao dia (máx. 100 mg/dia)."),
    ido=IDO(1, "Risco de retenção urinária e taquicardia."))

P["fitomenadiona"] = dict(
    pre=B(0.3, 0.4, 0.5, "mg/kg", None, None, "Pré-termo < 1.000 g: 0,3–0,5 mg/kg IM ao nascer (profilaxia).", cap=1),
    neo=B(1, 1, 2, "mg", None, None, "Profilaxia ao nascer: 1 mg IM. Doença hemorrágica: 1–2 mg EV lento/SC."),
    lac=B(1, 2, 10, "mg", None, None, "Deficiência: 1–2 mg/dose. Reversão de antagonista da vitamina K: 0,03 mg/kg (sangramento grave: até 5 mg). Máx. 10 mg/dose."),
    cri=B(1, 2, 10, "mg", None, None, "Deficiência: 1–2 mg/dose. Reversão de antagonista da vitamina K: 0,03 mg/kg (sangramento grave: até 5 mg). Máx. 10 mg/dose."),
    adl=B(2.5, 5, 10, "mg", None, None, "Reversão de antagonista da vitamina K: 2,5–10 mg (5–10 mg EV no sangramento grave)."),
    adu=B(2.5, 5, 10, "mg", None, None, "Reversão de varfarina: 2,5–10 mg (EV 5–10 mg no sangramento grave); máx. 10 mg/dose."),
    ido=IDO(1, "Mesma dose; risco de anafilaxia na via EV (infundir lentamente)."))

P["fluconazol_inj"] = dict(
    neo=B(12, 12, 25, "mg/kg", (24,), None, "Tratamento: ataque de 25 mg/kg e depois 12 mg/kg 1×/dia. Profilaxia (< 1.000 g): 3–6 mg/kg 2×/semana."),
    lac=B(6, 12, 12, "mg/kg", (24,), None, "6–12 mg/kg 1×/dia (ataque de 12 mg/kg na candidemia).", cap=800),
    cri=B(6, 12, 12, "mg/kg", (24,), None, "6–12 mg/kg 1×/dia (ataque de 12 mg/kg na candidemia).", cap=800),
    adl=B(6, 12, 12, "mg/kg", (24,), None, "6–12 mg/kg 1×/dia (ataque de 12 mg/kg na candidemia).", cap=800),
    adu=B(200, 400, 800, "mg", (24,), 800, "Candidemia: ataque de 800 mg (12 mg/kg), depois 400 mg (6 mg/kg) 1×/dia. Criptococose: até 1.200 mg/dia."),
    ido=IDO(1, "Ajustar pelo ClCr; atenção a interações e ao intervalo QT."))

P["folinato_calcio"] = dict(
    neo=B(10, 10, 10, "mg", None, None, "Toxoplasmose congênita (com pirimetamina): 10 mg 3×/semana."),
    lac=B(10, 15, 15, "mg/m2", (6,), None, "Resgate de metotrexato: 10–15 mg/m² 6/6 h a partir de 24 h, ajustado pelo nível de MTX (conforme protocolo)."),
    cri=B(10, 15, 15, "mg/m2", (6,), None, "Resgate de metotrexato: 10–15 mg/m² 6/6 h a partir de 24 h, ajustado pelo nível de MTX (conforme protocolo)."),
    adl=B(10, 15, 15, "mg/m2", (6,), None, "Resgate de metotrexato: 10–15 mg/m² 6/6 h a partir de 24 h, ajustado pelo nível de MTX (conforme protocolo)."),
    adu=B(10, 15, 25, "mg", (6,), None, "Resgate de MTX: 15 mg (10 mg/m²) 6/6 h por 10 doses ou conforme protocolo. Toxoplasmose: 10–25 mg/dia."),
    ido=IDO(1, "Sem ajuste."))

P["furosemida"] = dict(
    neo=B(1, 1, 2, "mg/kg", (12, 24), None, "1 mg/kg/dose a cada 12–24 h (prematuros: 24 h); até 2 mg/kg/dose."),
    lac=B(0.5, 1, 2, "mg/kg", (6, 12), 6, "0,5–2 mg/kg/dose a cada 6–12 h. Infusão: 0,05–0,4 mg/kg/h.", cap=80, capd=320),
    cri=B(0.5, 1, 2, "mg/kg", (6, 12), 6, "0,5–2 mg/kg/dose a cada 6–12 h. Infusão: 0,05–0,4 mg/kg/h.", cap=80, capd=320),
    adl=B(0.5, 1, 2, "mg/kg", (6, 12), 6, "0,5–2 mg/kg/dose a cada 6–12 h.", cap=80, capd=320),
    adu=B(20, 40, 80, "mg", (6, 12), 600, "20–40 mg/dose, repetir ou dobrar a cada 2 h conforme a resposta. Na insuficiência renal, até 600 mg/dia (velocidade ≤ 4 mg/min)."),
    ido=IDO(1, "Hipovolemia e distúrbios eletrolíticos: monitorar."))

P["gentamicina"] = dict(
    pre=B(4, 4, 5, "mg/kg", (36, 48), None, "Idade pós-menstrual ≤ 29 sem: 48 h; 30–34 sem: 36 h. Guiar por nível (vale < 1 mcg/mL)."),
    neo=B(4, 4, 5, "mg/kg", (24, 36, 48), None, "Intervalo pela idade pós-menstrual: ≤ 29 sem 48 h; 30–34 sem 36 h; ≥ 35 sem 24 h. Vale < 1 mcg/mL."),
    lac=B(5, 7, 7.5, "mg/kg", (24,), 7.5, "5–7,5 mg/kg 1×/dia (ou 2–2,5 mg/kg 8/8 h). Vale < 1 mcg/mL.", capd=600),
    cri=B(5, 7, 7.5, "mg/kg", (24,), 7.5, "5–7,5 mg/kg 1×/dia (ou 2–2,5 mg/kg 8/8 h). Vale < 1 mcg/mL.", capd=600),
    adl=B(5, 7, 7.5, "mg/kg", (24,), 7.5, "5–7 mg/kg 1×/dia. Vale < 1 mcg/mL.", capd=600),
    adu=B(5, 7, 7, "mg/kg", (24,), 7, "5–7 mg/kg 1×/dia (ou 1–1,7 mg/kg 8/8 h). Sinergia: 3 mg/kg/dia. Usar peso ideal/ajustado em obesos."),
    ido=IDO(1, "Ajustar pelo ClCr; monitorar nível sérico e audição."))

P["heparina_sodica"] = dict(
    neo=B(75, 75, 75, "UI/kg", None, None, "TEV: bolo de 75 UI/kg e infusão de 28 UI/kg/h; titular por anti-Xa 0,35–0,7 UI/mL ou TTPa."),
    lac=B(75, 75, 100, "UI/kg", None, None, "Bolo de 75–100 UI/kg; infusão de 28 UI/kg/h (< 1 ano) ou 20 UI/kg/h (≥ 1 ano). Titular por anti-Xa ou TTPa."),
    cri=B(75, 75, 100, "UI/kg", None, None, "Bolo de 75 UI/kg e infusão de 20 UI/kg/h; titular por anti-Xa ou TTPa."),
    adl=B(75, 75, 100, "UI/kg", None, None, "Bolo de 75 UI/kg e infusão de 20 UI/kg/h; titular por anti-Xa ou TTPa."),
    adu=B(60, 80, 80, "UI/kg", None, None, "TEV: 80 UI/kg em bolo + 18 UI/kg/h. SCA: 60 UI/kg (máx. 4.000 UI) + 12 UI/kg/h (máx. 1.000 UI/h). Profilaxia: 5.000 UI SC 8–12/12 h."),
    ido=IDO(1, "Maior risco hemorrágico: monitorar TTPa/anti-Xa e plaquetas."),
    nota="Dose de ataque (bolo); a manutenção é por infusão contínua titulada.")

P["hidralazina"] = dict(
    neo=B(0.1, 0.25, 0.5, "mg/kg", (6, 8), None, "0,1–0,5 mg/kg/dose a cada 6–8 h."),
    lac=B(0.1, 0.15, 0.2, "mg/kg", (4, 6), None, "0,1–0,2 mg/kg/dose a cada 4–6 h; máx. 0,4 mg/kg/dose.", cap=20),
    cri=B(0.1, 0.15, 0.2, "mg/kg", (4, 6), None, "0,1–0,2 mg/kg/dose a cada 4–6 h; máx. 0,4 mg/kg/dose.", cap=20),
    adl=B(0.1, 0.15, 0.2, "mg/kg", (4, 6), None, "0,1–0,2 mg/kg/dose a cada 4–6 h.", cap=20),
    adu=B(5, 10, 20, "mg", (4, 6), None, "Pré-eclâmpsia: 5 mg EV, repetir a cada 20 min (30 mg no total). Geral: 10–20 mg a cada 4–6 h; máx. 40 mg/dose."),
    ido=IDO(0.5, "Hipotensão e taquicardia reflexa: iniciar com metade da dose do adulto."))

_hc = lambda n, cap: B(4, 4, 8, "mg/kg", (6,), 32, n, cap=cap)
P["hidrocortisona"] = dict(
    neo=B(1, 1, 1, "mg/kg", (8,), None, "Hipotensão refratária: 1 mg/kg/dose 8/8 h. Insuficiência adrenal: 50–100 mg/m²/dia."),
    lac=_hc("Asma: 4 mg/kg 6/6 h. Crise adrenal: 50–100 mg/m² em bolo (< 3 anos: 25 mg), depois 50–100 mg/m²/dia ÷ 6/6 h.", 100),
    cri=_hc("Asma: 4 mg/kg 6/6 h. Crise adrenal: 50–100 mg/m² em bolo (3–12 anos: 50 mg), depois 50–100 mg/m²/dia ÷ 6/6 h.", 100),
    adl=_hc("Asma: 4 mg/kg 6/6 h. Crise adrenal: 100 mg em bolo, depois 50–100 mg/m²/dia ÷ 6/6 h.", 100),
    adu=B(50, 50, 100, "mg", (6,), 300, "Choque séptico: 50 mg 6/6 h (200 mg/dia). Crise adrenal: 100 mg em bolo e 200 mg/dia; até 300 mg/dia."),
    ido=IDO(1, "Hiperglicemia e delirium: usar a menor dose eficaz."))

P["lidocaina"] = dict(
    neo=B(1, 2, 3, "mg/kg", None, None, "Anestesia local: até 3 mg/kg."),
    lac=B(1, 3, 4.5, "mg/kg", None, None, "Anestesia local: até 4,5 mg/kg (máx. 300 mg). Antiarrítmico: 1 mg/kg EV em bolo e infusão de 20–50 mcg/kg/min.", cap=300),
    cri=B(1, 3, 4.5, "mg/kg", None, None, "Anestesia local: até 4,5 mg/kg (máx. 300 mg). Antiarrítmico: 1 mg/kg EV em bolo e infusão de 20–50 mcg/kg/min.", cap=300),
    adl=B(1, 3, 4.5, "mg/kg", None, None, "Anestesia local: até 4,5 mg/kg (máx. 300 mg). Antiarrítmico: 1 mg/kg EV.", cap=300),
    adu=B(1, 3, 4.5, "mg/kg", None, None, "Anestesia local: até 4,5 mg/kg (máx. 300 mg). ACLS: 1–1,5 mg/kg EV, repetir 0,5–0,75 mg/kg; infusão 1–4 mg/min.", cap=300),
    ido=IDO(0.75, "Reduzir a infusão na insuficiência cardíaca e na hepatopatia. Estimativa conservadora: dose do adulto × 0,75."))

_mer = B(10, 20, 40, "mg/kg", (8,), 120, "≥ 3 meses: 10–20 mg/kg 8/8 h; meningite: 40 mg/kg 8/8 h. < 3 meses: seguir a posologia neonatal.", cap=2000, capd=6000)
P["meropenem"] = dict(
    neo=B(20, 20, 40, "mg/kg", (8, 12), None, "20 mg/kg a cada 8–12 h, conforme idade gestacional e pós-natal. Meningite: 40 mg/kg 8/8 h."),
    lac=_mer, cri=_mer, adl=_mer,
    adu=B(1000, 1000, 2000, "mg", (8,), 6000, "1 g 8/8 h; meningite/infecção grave: 2 g 8/8 h."),
    ido=IDO(1, "Ajustar pelo ClCr."))

P["metilprednisolona"] = dict(
    neo=NR("Dados limitados; evitar diluentes com álcool benzílico."),
    lac=B(0.5, 1, 2, "mg/kg", (6, 12, 24), 30, "Asma/inflamação: 1–2 mg/kg/dia ÷ 6–12 h (máx. 60 mg/dia). Pulsoterapia: 30 mg/kg/dia por 3 dias (máx. 1 g).", cap=1000),
    cri=B(0.5, 1, 2, "mg/kg", (6, 12, 24), 30, "Asma/inflamação: 1–2 mg/kg/dia ÷ 6–12 h (máx. 60 mg/dia). Pulsoterapia: 30 mg/kg/dia por 3 dias (máx. 1 g).", cap=1000),
    adl=B(0.5, 1, 2, "mg/kg", (6, 12, 24), 30, "Asma/inflamação: 1–2 mg/kg/dia ÷ 6–12 h. Pulsoterapia: 30 mg/kg/dia por 3 dias (máx. 1 g).", cap=1000),
    adu=B(40, 60, 80, "mg", (24,), None, "40–80 mg/dia. Pulsoterapia: 500–1.000 mg/dia por 3–5 dias (máx. 1 g/dose)."),
    ido=IDO(1, "Hiperglicemia, delirium e infecção: usar a menor dose eficaz."))

_mtz = B(7.5, 7.5, 10, "mg/kg", (6, 8), 40, "7,5 mg/kg/dose 8/8 h.", cap=500, capd=4000)
P["metronidazol_inj"] = dict(
    neo=B(7.5, 7.5, 15, "mg/kg", (8, 12), None, "Ataque de 15 mg/kg, depois 7,5 mg/kg a cada 8–12 h conforme a idade pós-menstrual."),
    lac=_mtz, cri=_mtz, adl=_mtz,
    adu=B(500, 500, 500, "mg", (8,), 4000, "500 mg 8/8 h."),
    ido=IDO(1, "Reduzir a dose na hepatopatia grave."))

_mcl = B(0.1, 0.1, 0.15, "mg/kg", (8,), 0.5, "1–18 anos: 0,1–0,15 mg/kg/dose, até 3×/dia, por no máximo 5 dias.", cap=10)
P["metoclopramida_inj"] = dict(neo=NR("Contraindicada (< 1 ano)."),
    lac=NR("Contraindicada em < 1 ano; de 1 a 2 anos evitar (alto risco de reações extrapiramidais)."),
    cri=_mcl, adl=_mcl,
    adu=B(5, 10, 10, "mg", (8,), 30, "10 mg até 3×/dia, por no máximo 5 dias (0,5 mg/kg/dia)."),
    ido=IDO(0.5, "Reduzir a dose pela metade; maior risco de discinesia tardia e sintomas extrapiramidais."))

P["norepinefrina"] = dict(
    neo=_inf(0.05, 0.1, 1, "Infusão contínua 0,05–1 mcg/kg/min; via exclusiva."),
    lac=_inf(0.05, 0.1, 1, "Infusão contínua 0,05–1 mcg/kg/min, titulada pela PAM."),
    cri=_inf(0.05, 0.1, 1, "Infusão contínua 0,05–1 mcg/kg/min, titulada pela PAM."),
    adl=_inf(0.05, 0.1, 1, "Infusão contínua 0,05–1 mcg/kg/min, titulada pela PAM."),
    adu=_inf(0.01, 0.1, 0.5, "Alvo PAM ≥ 65 mmHg; até 3 mcg/kg/min em choque refratário."),
    ido=IDO(1, "Risco de isquemia periférica."))

_ome = B(0.7, 1, 1, "mg/kg", (12, 24), None, "Off-label: 1 mg/kg/dose 1–2×/dia.", cap=40)
P["omeprazol_inj"] = dict(neo=NR("Não estabelecido para via EV."), lac=_ome, cri=_ome, adl=_ome,
    adu=B(40, 40, 80, "mg", (12, 24), None, "40 mg 1×/dia. Hemorragia digestiva alta: 80 mg em bolo + 8 mg/h por 72 h (ou 40 mg 12/12 h)."),
    ido=IDO(1, "Uso prolongado associa-se a fratura e infecção por C. difficile."))

_ond = B(0.1, 0.1, 0.15, "mg/kg", (8, 12), 0.45, "≥ 1 mês: 0,1–0,15 mg/kg/dose (pós-operatório 0,1 mg/kg; quimioterapia 0,15 mg/kg 8/8 h). Prolonga o QT.", cap=16)
P["ondansetrona"] = dict(neo=NR("Não estabelecido."), lac=_ond, cri=_ond, adl=_ond,
    adu=B(4, 4, 8, "mg", (8, 12), None, "4–8 mg/dose; quimioterapia: 8 mg ou 0,15 mg/kg 8/8 h; máx. 16 mg/dose EV (prolonga o QT)."),
    ido=IDO(1, "≥ 75 anos: dose inicial ≤ 8 mg em 15 min; atenção ao intervalo QT."))

_oxa = B(17, 37.5, 50, "mg/kg", (4, 6), 200, "100–200 mg/kg/dia ÷ 4–6 h.", cap=2000, capd=12000)
P["oxacilina"] = dict(
    neo=B(25, 50, 50, "mg/kg", (6, 8, 12), 200, "25–50 mg/kg/dose a cada 8–12 h (6/6 h após 7 dias). Meningite: 50 mg/kg 6/6 h."),
    lac=_oxa, cri=_oxa, adl=_oxa,
    adu=B(1000, 2000, 2000, "mg", (4, 6), 12000, "1–2 g a cada 4–6 h."),
    ido=IDO(1, "Sem ajuste renal habitual."))

_pan = B(0.5, 1, 1, "mg/kg", (12, 24), None, "Off-label: 1 mg/kg/dose 1×/dia (até 2×/dia).", cap=40)
P["pantoprazol"] = dict(neo=NR("Não estabelecido."), lac=_pan, cri=_pan, adl=_pan,
    adu=B(40, 40, 80, "mg", (12, 24), 240, "40 mg 1–2×/dia. HDA: 80 mg + 8 mg/h por 72 h. Até 240 mg/dia na síndrome de Zollinger-Ellison."),
    ido=IDO(1, "Sem ajuste."))
