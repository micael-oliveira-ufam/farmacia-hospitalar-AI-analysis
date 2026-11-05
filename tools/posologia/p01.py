from dsl import B, NR, IDO
P = {}

_ac = B(150, 150, 150, "mg/kg", None, None, "Antídoto (paracetamol), esquema de 21 h: 150 mg/kg em 1 h → 50 mg/kg em 4 h → 100 mg/kg em 16 h (300 mg/kg no total). Diluir em SG5%; reduzir o volume de diluente em neonatos e lactentes.")
P["acetilcisteina"] = dict(neo=_ac, lac=_ac, cri=_ac, adl=_ac,
    adu=B(150, 150, 150, "mg/kg", None, None, "Antídoto: mesmo esquema de 21 h (peso limitado a 100 kg). Como mucolítico: 300 mg 1–2×/dia."),
    ido=IDO(1, "Sem ajuste específico; atenção a broncoespasmo e sobrecarga de volume."),
    nota="Dose de ataque do antídoto (primeira etapa). Mucolítico em crianças: 150 mg (½ ampola) 1–2×/dia.")

_asc = B(100, 200, 300, "mg/dia", None, 300, "Escorbuto/reposição: dividir em 2–3 doses, por ≥ 1 semana.")
P["acido_ascorbico_inj"] = dict(
    neo=NR("Uso não padronizado; apenas em deficiência comprovada, com prescrição especializada."),
    lac=_asc, cri=_asc, adl=_asc,
    adu=B(100, 250, 500, "mg", (12, 24), 1000, "Escorbuto/deficiência: 100–250 mg 1–2×/dia; doses maiores apenas em protocolos específicos."),
    ido=IDO(1, "Cautela na insuficiência renal (risco de nefrolitíase por oxalato)."))

_tx = B(10, 10, 15, "mg/kg", (8,), None, "Sangramento/cirurgia: 10–15 mg/kg a cada 8 h. Trauma: 15 mg/kg em 10 min, depois 2 mg/kg/h por 8 h. Infundir lentamente (hipotensão em bolus rápido).", cap=1000)
P["acido_tranexamico"] = dict(
    neo=NR("Dados limitados (cirurgia cardíaca: protocolos específicos); uso sob especialista."),
    lac=_tx, cri=_tx, adl=_tx,
    adu=B(500, 1000, 1000, "mg", (6, 8), 4000, "Trauma (≤ 3 h): 1 g em 10 min + 1 g em 8 h. Hemorragia pós-parto: 1 g EV, repetir após 30 min se persistir."),
    ido=IDO(1, "Ajustar pela função renal (ClCr)."))

P["aciclovir"] = dict(
    neo=B(20, 20, 20, "mg/kg", (8,), None, "Herpes neonatal: 14 dias (pele/olhos/boca) ou 21 dias (SNC/disseminado). Hiperhidratação."),
    lac=B(10, 15, 20, "mg/kg", (8,), None, "< 3 meses: dose neonatal (20 mg/kg); 3 meses–11 anos: 10–15 mg/kg; encefalite: 20 mg/kg 8/8 h."),
    cri=B(10, 15, 20, "mg/kg", (8,), None, "10–15 mg/kg 8/8 h; encefalite e VZV em imunossuprimidos: 20 mg/kg 8/8 h (ou 500 mg/m²). Hiperhidratação."),
    adl=B(5, 10, 10, "mg/kg", (8,), None, "≥ 12 anos: 5–10 mg/kg 8/8 h; encefalite: 10 mg/kg 8/8 h."),
    adu=B(5, 10, 15, "mg/kg", (8,), None, "5–10 mg/kg 8/8 h (encefalite: 10 mg/kg); usar peso ideal em obesos. Hiperhidratação."),
    ido=IDO(1, "Ajuste obrigatório pelo ClCr; risco de neurotoxicidade."))

_alb = B(0.5, 1, 1, "g/kg", None, 6, "Hipoalbuminemia/hipovolemia: infundir em 2–4 h; pode associar furosemida. Monitorar a volemia.")
P["albumina_humana"] = dict(neo=B(0.5, 1, 1, "g/kg", None, None, "Hipoalbuminemia/hipovolemia: infundir em 2–4 h."),
    lac=_alb, cri=_alb, adl=_alb,
    adu=B(25, 25, 25, "g", None, None, "Hipovolemia: 25 g, repetir conforme resposta. Paracentese > 5 L: 6–8 g por litro retirado. PBE: 1,5 g/kg no D1 e 1 g/kg no D3. Máx. 2 g/kg/dia."),
    ido=IDO(1, "Risco de sobrecarga circulatória; infusão mais lenta."))

P["amicacina"] = dict(
    pre=B(15, 15, 18, "mg/kg", (36, 48), None, "Idade pós-menstrual ≤ 29 sem: 48 h; 30–34 sem: 36 h. Guiar por nível sérico."),
    neo=B(15, 15, 18, "mg/kg", (24, 36, 48), None, "Intervalo pela idade pós-menstrual: ≤ 29 sem 48 h; 30–34 sem 36 h; ≥ 35 sem 24 h. Guiar por nível sérico."),
    lac=B(15, 15, 20, "mg/kg", (24,), None, "15–20 mg/kg 1×/dia (ou 15–22,5 mg/kg/dia ÷ 8/8 h). Vale < 5 mcg/mL.", capd=1500),
    cri=B(15, 15, 20, "mg/kg", (24,), None, "15–20 mg/kg 1×/dia (ou 15–22,5 mg/kg/dia ÷ 8/8 h). Vale < 5 mcg/mL.", capd=1500),
    adl=B(15, 15, 20, "mg/kg", (24,), None, "15–20 mg/kg 1×/dia. Vale < 5 mcg/mL.", capd=1500),
    adu=B(15, 15, 20, "mg/kg", (24,), None, "15 mg/kg 1×/dia (até 20 mg/kg em infecção grave); usar peso ideal/ajustado em obesos.", capd=1500),
    ido=IDO(1, "Ajustar o intervalo pelo ClCr; monitorar nível sérico e audição."))

_amp_p = B(25, 50, 100, "mg/kg", (4, 6), 400, "100–200 mg/kg/dia ÷ 6/6 h; meningite: 300–400 mg/kg/dia ÷ 4–6 h (75–100 mg/kg/dose).", cap=3000, capd=12000)
P["ampicilina"] = dict(
    neo=B(50, 50, 100, "mg/kg", (6, 8, 12), None, "50 mg/kg 8–12/8–12 h. Meningite por SGB: 0–7 dias 100 mg/kg 8/8 h; > 7 dias 75 mg/kg 6/6 h."),
    lac=_amp_p, cri=_amp_p, adl=_amp_p,
    adu=B(1000, 2000, 2000, "mg", (4, 6), 12000, "1–2 g a cada 4–6 h; meningite/endocardite: 2 g 4/4 h (até 14 g/dia em protocolos)."),
    ido=IDO(1, "Ajustar o intervalo se ClCr < 30 mL/min."))

_atr = "Dose mínima absoluta de 0,1 mg (risco de bradicardia paradoxal com doses menores)."
P["atropina"] = dict(
    neo=B(0.01, 0.02, 0.03, "mg/kg", None, None, "Pré-intubação/bradicardia: 0,01–0,02 mg/kg EV. " + _atr),
    lac=B(0.02, 0.02, 0.05, "mg/kg", None, None, "Bradicardia (PALS): 0,02 mg/kg EV/IO, repetir 1×. Organofosforado: 0,02–0,05 mg/kg a cada 10–20 min até atropinização. " + _atr, cap=0.5),
    cri=B(0.02, 0.02, 0.05, "mg/kg", None, None, "Bradicardia (PALS): 0,02 mg/kg EV/IO, repetir 1×. Organofosforado: 0,02–0,05 mg/kg a cada 10–20 min até atropinização. " + _atr, cap=0.5),
    adl=B(0.02, 0.02, 0.05, "mg/kg", None, None, "Bradicardia: 0,02 mg/kg, máx. 1 mg/dose. Organofosforado: até atropinização.", cap=1),
    adu=B(0.5, 1, 2, "mg", None, 3, "Bradicardia (ACLS): 1 mg a cada 3–5 min, máx. 3 mg no total. Organofosforado: 1–2 mg, dobrando a cada 5 min até atropinização (sem teto)."),
    ido=IDO(1, "Maior risco de delirium e retenção urinária."))

_pen_p = B(25000, 50000, 100000, "UI/kg", (4, 6), 400000, "100.000–300.000 UI/kg/dia ÷ 4/4 a 6/6 h; meningite: 300.000–400.000 UI/kg/dia.", cap=4000000, capd=24000000)
P["benzilpenicilina_cristalina"] = dict(
    neo=B(50000, 50000, 150000, "UI/kg", (8, 12), 450000, "≤ 7 dias: 12/12 h; > 7 dias: 8/8 h. Sífilis congênita: 50.000 UI/kg por 10 dias. Meningite por SGB: 150.000–450.000 UI/kg/dia."),
    lac=_pen_p, cri=_pen_p, adl=_pen_p,
    adu=B(2000000, 3000000, 4000000, "UI", (4,), 24000000, "2–4 milhões UI a cada 4 h. Neurossífilis: 3–4 milhões UI 4/4 h por 14 dias (18–24 milhões UI/dia)."),
    ido=IDO(1, "Ajustar na insuficiência renal; cada 1 milhão UI contém ≈ 1,7 mEq de K⁺."))

P["benzilpenicilina_benzatina"] = dict(
    neo=B(50000, 50000, 50000, "UI/kg", None, None, "Sífilis congênita (casos selecionados, conforme PCDT): dose única."),
    lac=B(25000, 50000, 50000, "UI/kg", None, None, "Sífilis: 50.000 UI/kg dose única. Faringite: < 27 kg 600.000 UI; ≥ 27 kg 1.200.000 UI. Profilaxia da febre reumática: ≤ 20 kg 600.000 UI; > 20 kg 1.200.000 UI a cada 21 dias.", cap=2400000),
    cri=B(25000, 50000, 50000, "UI/kg", None, None, "Faringite: < 27 kg 600.000 UI; ≥ 27 kg 1.200.000 UI (dose única). Profilaxia da febre reumática: ≤ 20 kg 600.000 UI; > 20 kg 1.200.000 UI a cada 21 dias. Sífilis: 50.000 UI/kg.", cap=2400000),
    adl=B(1200000, 1200000, 2400000, "UI", None, None, "Faringite: 1.200.000 UI dose única. Profilaxia da febre reumática: 1.200.000 UI a cada 21 dias. Sífilis: 2.400.000 UI."),
    adu=B(1200000, 2400000, 2400000, "UI", None, None, "Sífilis recente: 2.400.000 UI dose única (1.200.000 UI em cada glúteo). Sífilis tardia/latente: 2.400.000 UI/semana por 3 semanas."),
    ido=IDO(1, "Sem ajuste."))

_bro = B(0.17, 0.25, 0.33, "mg/kg", (8,), 1, "0,5–1 mg/kg/dia ÷ 3 doses.", cap=10)
P["bromoprida_inj"] = dict(neo=NR("Não recomendado."),
    lac=NR("Evitar em < 1 ano (reações extrapiramidais); acima de 1 ano usar a dose pediátrica com cautela."),
    cri=_bro, adl=_bro,
    adu=B(10, 10, 10, "mg", (8, 12), 30, "10 mg (1 ampola) 1–2×/dia, podendo chegar a 3×/dia."),
    ido=IDO(1, "Maior risco de sintomas extrapiramidais; usar a menor dose."))

P["bupivacaina"] = dict(
    neo=B(1, 2, 2, "mg/kg", None, None, "Bolo: até 2 mg/kg. Infusão peridural: 0,2 mg/kg/h."),
    lac=B(1, 2, 2.5, "mg/kg", None, None, "Bolo 2–2,5 mg/kg. Caudal: 0,5–1 mL/kg da solução 0,25%. Infusão: até 0,4 mg/kg/h.", cap=150),
    cri=B(1, 2, 2.5, "mg/kg", None, None, "Bolo 2–2,5 mg/kg. Caudal: 0,5–1 mL/kg da solução 0,25%. Infusão: até 0,4 mg/kg/h.", cap=150),
    adl=B(1, 2, 2.5, "mg/kg", None, None, "Bolo 2–2,5 mg/kg, máx. 150 mg por aplicação.", cap=150),
    adu=B(25, 100, 150, "mg", None, 400, "Conforme o bloqueio: 25–150 mg; máx. 2 mg/kg ou 150 mg por aplicação e 400 mg/24 h."),
    ido=IDO(0.75, "Reduzir a dose (maior sensibilidade); iniciar pela menor dose do bloqueio. Estimativa conservadora: dose do adulto × 0,75."))

_bp_c = lambda a, r, b, n, cap=None: B(a, r, b, "mg/kg", None, None, n, cap=cap)
P["bupivacaina_pesada"] = dict(
    neo=_bp_c(0.4, 0.5, 0.5, "Raquianestesia pediátrica (anestesiologista): 0,5 mg/kg se < 5 kg."),
    lac=_bp_c(0.3, 0.4, 0.5, "Raquianestesia: 0,5 mg/kg (< 5 kg); 0,4 mg/kg (5–15 kg)."),
    cri=_bp_c(0.3, 0.3, 0.4, "Raquianestesia: 0,4 mg/kg (5–15 kg); 0,3 mg/kg (> 15 kg).", cap=15),
    adl=_bp_c(0.2, 0.25, 0.3, "Raquianestesia: dose por peso/altura, máx. 15 mg.", cap=15),
    adu=B(7.5, 12, 15, "mg", None, None, "Raquianestesia: 7,5–15 mg (cesárea 10–12 mg), conforme o nível desejado. Uso exclusivo do anestesiologista."),
    ido=IDO(0.7, "Reduzir a dose (bloqueio mais extenso e hipotensão); estimativa conservadora: dose do adulto × 0,7."),
    nota="Raquianestesia: dose depende da técnica, do nível do bloqueio e da altura; uso exclusivo do anestesiologista.")

_cft = B(20, 25, 40, "mg/kg", (6,), 160, "80–160 mg/kg/dia ÷ 4/4–6/6 h.", cap=2000, capd=12000)
P["cefalotina"] = dict(
    neo=B(20, 20, 20, "mg/kg", (8, 12), None, "Dados limitados; preferir cefazolina."),
    lac=_cft, cri=_cft, adl=_cft,
    adu=B(500, 1000, 2000, "mg", (4, 6), 12000, "0,5–2 g a cada 4–6 h. Profilaxia cirúrgica: 1–2 g."),
    ido=IDO(1, "Ajustar pelo ClCr."))

_cfz = B(17, 25, 50, "mg/kg", (8,), 150, "25–100 mg/kg/dia ÷ 8/8 h (até 150 mg/kg/dia em infecção grave). Profilaxia cirúrgica: 30 mg/kg.", cap=2000, capd=6000)
P["cefazolina"] = dict(
    neo=B(25, 25, 25, "mg/kg", (8, 12), None, "12/12 h se ≤ 7 dias de vida; 8/8 h depois."),
    lac=_cfz, cri=_cfz, adl=_cfz,
    adu=B(1000, 2000, 2000, "mg", (8,), 12000, "1–2 g 8/8 h. Profilaxia cirúrgica: 2 g (3 g se ≥ 120 kg)."),
    ido=IDO(1, "Ajustar pelo ClCr."))

_ctx = B(25, 50, 50, "mg/kg", (12, 24), 100, "50–75 mg/kg/dia ÷ 12–24 h; meningite: 100 mg/kg/dia ÷ 12/12 h.", cap=2000, capd=4000)
P["ceftriaxona"] = dict(
    neo=B(25, 50, 50, "mg/kg", (24,), None, "50 mg/kg 1×/dia. Oftalmia gonocócica: 25–50 mg/kg IM dose única (máx. 125 mg). Evitar com hiperbilirrubinemia e cálcio EV."),
    lac=_ctx, cri=_ctx, adl=_ctx,
    adu=B(1000, 2000, 2000, "mg", (12, 24), 4000, "1–2 g 1×/dia; meningite: 2 g 12/12 h."),
    ido=IDO(1, "Sem ajuste renal isolado."))

_cip = B(10, 10, 15, "mg/kg", (8, 12), None, "Uso restrito (sem alternativa): risco de artropatia.", cap=400, capd=1200)
P["ciprofloxacino_inj"] = dict(neo=NR("Não recomendado."), lac=_cip, cri=_cip, adl=_cip,
    adu=B(400, 400, 400, "mg", (8, 12), 1200, "400 mg a cada 8–12 h."),
    ido=IDO(1, "Ajustar pelo ClCr; risco de tendinopatia e delirium."))

_cla = B(7.5, 7.5, 7.5, "mg/kg", (12,), 15, "Uso EV não padronizado em bula (off-label). Pode prolongar o intervalo QT.", cap=500)
P["claritromicina_inj"] = dict(neo=NR("Não estabelecido."), lac=_cla, cri=_cla, adl=_cla,
    adu=B(500, 500, 500, "mg", (12,), 1000, "500 mg 12/12 h."),
    ido=IDO(1, "Reduzir 50% se ClCr < 30; atenção a interações (CYP3A4) e ao intervalo QT."))

_cli = B(5, 8, 13, "mg/kg", (6, 8), 40, "20–40 mg/kg/dia ÷ 6–8 h.", cap=900, capd=2700)
P["clindamicina"] = dict(
    neo=B(5, 5, 7, "mg/kg", (6, 8, 12), None, "5 mg/kg 8/8 h (≤ 7 dias) ou a cada 6–8 h (> 7 dias); até 7 mg/kg/dose."),
    lac=_cli, cri=_cli, adl=_cli,
    adu=B(600, 600, 900, "mg", (8,), 2700, "600–900 mg 8/8 h; até 4,8 g/dia em infecção com risco de vida."),
    ido=IDO(1, "Atenção a colite por C. difficile."))

P["dexametasona_inj"] = dict(
    neo=B(0.075, 0.075, 0.075, "mg/kg", (12,), 0.15, "Displasia broncopulmonar/extubação (esquema DART): reduzir progressivamente; sob neonatologista."),
    lac=B(0.15, 0.15, 0.6, "mg/kg", (6, 24), None, "Crupe: 0,15–0,6 mg/kg dose única (máx. 12 mg). Meningite: 0,15 mg/kg 6/6 h por 2–4 dias. Edema de via aérea: 0,5 mg/kg 6/6 h.", cap=16),
    cri=B(0.15, 0.15, 0.6, "mg/kg", (6, 24), None, "Crupe: 0,6 mg/kg dose única (máx. 12 mg). Meningite: 0,15 mg/kg 6/6 h por 2–4 dias. Antiemético: 0,15 mg/kg. Edema de via aérea: 0,5 mg/kg 6/6 h.", cap=16),
    adl=B(0.15, 0.15, 0.6, "mg/kg", (6, 24), None, "Meningite: 0,15 mg/kg 6/6 h (máx. 10 mg/dose). Antiemético 0,15 mg/kg.", cap=16),
    adu=B(4, 10, 10, "mg", (6, 24), 40, "Edema cerebral: 10 mg EV e 4 mg 6/6 h. Meningite: 10 mg 6/6 h por 4 dias. Antiemético: 4–8 mg. Protocolos oncológicos podem exceder 40 mg/dia."),
    ido=IDO(1, "Hiperglicemia, delirium e osteoporose: usar a menor dose pelo menor tempo."))

_dip = B(10, 15, 25, "mg/kg", (6, 8), 100, "10–25 mg/kg/dose. Infundir em 15–30 min (risco de hipotensão em bolus rápido). Contraindicada < 3 meses ou < 5 kg; 3–11 meses (5–8 kg): somente IM.", cap=1000, capd=4000)
P["dipirona_inj"] = dict(neo=NR("Contraindicada (< 3 meses ou < 5 kg)."), lac=_dip, cri=_dip, adl=_dip,
    adu=B(1000, 1000, 2500, "mg", (6, 8), 5000, "≥ 15 anos: 1–2,5 g por dose, até 4×/dia (máx. 5 g/dia)."),
    ido=IDO(0.75, "Risco de hipotensão; reduzir na insuficiência renal/hepática. Estimativa conservadora: dose do adulto × 0,75."))

_dob = lambda n: B(2, 5, 20, "mcg/kg/min", None, None, n)
P["dobutamina"] = dict(
    neo=_dob("Infusão contínua: iniciar com 5 mcg/kg/min e titular."),
    lac=_dob("Infusão contínua: iniciar com 5 mcg/kg/min e titular pela resposta."),
    cri=_dob("Infusão contínua: iniciar com 5 mcg/kg/min e titular pela resposta."),
    adl=_dob("Infusão contínua: iniciar com 5 mcg/kg/min e titular pela resposta."),
    adu=_dob("Infusão contínua 2–20 mcg/kg/min; até 40 mcg/kg/min em casos excepcionais."),
    ido=IDO(1, "Risco de arritmia e isquemia: iniciar na menor dose."))
