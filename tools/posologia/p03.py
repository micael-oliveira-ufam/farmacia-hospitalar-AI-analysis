from dsl import B, NR, IDO
P = {}

_pro = B(0.25, 0.5, 1, "mg/kg", (4, 6, 8), 2, "≥ 2 anos: 0,25–1 mg/kg/dose a cada 4–6 h. Evitar < 2 anos (depressão respiratória).", cap=25)
P["prometazina"] = dict(neo=NR("Contraindicada (< 2 anos)."), lac=NR("Contraindicada em < 2 anos (depressão respiratória grave)."),
    cri=_pro, adl=_pro,
    adu=B(12.5, 25, 25, "mg", (4, 6), 100, "12,5–25 mg a cada 4–6 h (máx. 100 mg/dia). EV: diluir e infundir lentamente (risco de lesão tecidual)."),
    ido=IDO(0.5, "Evitar (lista de Beers): sedação, quedas e efeitos anticolinérgicos; se necessário, 6,25–12,5 mg."))

_pip = B(80, 100, 100, "mg/kg", (6, 8), 400, "Dose expressa em piperacilina. 2–9 meses: 80 mg/kg 8/8 h; > 9 meses: 100 mg/kg 6–8 h. Pseudomonas: infusão prolongada (4 h).", cap=4000, capd=16000)
P["piperacilina_tazobactam"] = dict(
    neo=B(100, 100, 100, "mg/kg", (8, 12), 300, "Dose de piperacilina: 100 mg/kg a cada 8–12 h conforme idade gestacional/pós-natal."),
    lac=_pip, cri=_pip, adl=_pip,
    adu=B(3375, 4500, 4500, "mg", (6, 8), 18000, "Piperacilina + tazobactam 4,5 g a cada 6–8 h (3,375 g 6/6 h em infecções não graves); até 18 g/dia de piperacilina. Pseudomonas: infusão prolongada."),
    ido=IDO(1, "Ajustar pelo ClCr."))

P["salbutamol_inj"] = dict(
    neo=B(4, 4, 4, "mcg/kg", None, None, "Hiperpotassemia: 4 mcg/kg EV em 5 min (uso especializado)."),
    lac=B(5, 15, 15, "mcg/kg", None, None, "Asma grave refratária (UTI): 15 mcg/kg EV em 10 min (máx. 250 mcg) e depois 1–2 mcg/kg/min (até 5).", cap=250),
    cri=B(5, 15, 15, "mcg/kg", None, None, "Asma grave refratária (UTI): 15 mcg/kg EV em 10 min (máx. 250 mcg) e depois 1–2 mcg/kg/min (até 5).", cap=250),
    adl=B(5, 15, 15, "mcg/kg", None, None, "Asma grave refratária (UTI): 15 mcg/kg EV em 10 min (máx. 250 mcg) e depois 1–2 mcg/kg/min.", cap=250),
    adu=B(250, 250, 250, "mcg", None, None, "250 mcg EV lenta; infusão de 3–20 mcg/min. SC/IM: 500 mcg a cada 4 h."),
    ido=IDO(0.75, "Taquiarritmias e hipocalemia: monitorar ECG e potássio."))

_smx = B(4, 5, 6, "mg/kg", (12,), 12, "Dose expressa em trimetoprima (TMP): 8–12 mg/kg/dia ÷ 12/12 h. Pneumocistose: 15–20 mg/kg/dia ÷ 6–8 h.", cap=480, capd=960)
P["sulfametoxazol_trimetoprima_inj"] = dict(
    neo=NR("Contraindicado em < 2 meses (kernicterus), salvo toxoplasmose/pneumocistose sob especialista."),
    lac=_smx, cri=_smx, adl=_smx,
    adu=B(4, 5, 5, "mg/kg", (6, 8, 12), 20, "Dose em TMP: 8–10 mg/kg/dia ÷ 8–12 h; pneumocistose: 15–20 mg/kg/dia ÷ 6–8 h."),
    ido=IDO(1, "Ajustar pelo ClCr; risco de hiperpotassemia."),
    nota="Dose por dose = componente trimetoprima.")

P["suxametonio"] = dict(
    neo=B(2, 2, 3, "mg/kg", None, None, "Intubação de sequência rápida: 2–3 mg/kg EV."),
    lac=B(2, 2, 4, "mg/kg", None, None, "< 1 ano: 2 mg/kg EV; IM 4 mg/kg. Risco de hipercalemia/rabdomiólise em miopatias.", cap=150),
    cri=B(1, 1.5, 2, "mg/kg", None, None, "1–10 anos: 1–2 mg/kg EV (IM 4 mg/kg).", cap=150),
    adl=B(1, 1, 1.5, "mg/kg", None, None, "Adolescentes: 1–1,5 mg/kg EV.", cap=150),
    adu=B(1, 1.5, 1.5, "mg/kg", None, None, "1–1,5 mg/kg EV (máx. 150 mg).", cap=150),
    ido=IDO(1, "Sem ajuste; contraindicações usuais (hipercalemia, queimadura extensa)."))

P["tenoxicam"] = dict(neo=NR("Não recomendado."), lac=NR("Não estabelecido em pediatria."), cri=NR("Não estabelecido em pediatria."), adl=NR("Uso em < 18 anos não estabelecido."),
    adu=B(20, 20, 40, "mg", (24,), 40, "20 mg 1×/dia; pós-operatório: 40 mg 1×/dia por até 5 dias."),
    ido=IDO(0.5, "Risco renal, gastrointestinal e cardiovascular; usar a menor dose (20 mg/dia)."))

_van = B(10, 15, 20, "mg/kg", (6, 8), 60, "10–15 mg/kg/dose 6/6 h (60 mg/kg/dia) guiado por AUC 400–600; infundir em ≥ 60 min.", cap=2000, capd=3600)
P["vancomicina"] = dict(
    pre=B(10, 15, 15, "mg/kg", (12, 24), None, "Intervalo pela idade pós-menstrual e creatinina; guiar por AUC ou vale."),
    neo=B(10, 15, 15, "mg/kg", (8, 12, 24), None, "10–15 mg/kg a cada 8–24 h conforme idade pós-menstrual e creatinina; guiar por AUC 400–600."),
    lac=_van, cri=_van, adl=_van,
    adu=B(15, 20, 20, "mg/kg", (8, 12), None, "Ataque 20–35 mg/kg (máx. 3 g); manutenção 15–20 mg/kg a cada 8–12 h guiada por AUC 400–600.", cap=2000),
    ido=IDO(1, "Ajustar por ClCr e nível sérico; risco de nefrotoxicidade."))

P["vitaminas_complexo_b_inj"] = dict(neo=NR("Sem posologia padronizada; seguir protocolo institucional."), lac=NR("Sem posologia padronizada; seguir protocolo institucional."),
    cri=NR("Sem posologia padronizada; seguir protocolo institucional."), adl=NR("Sem posologia padronizada; seguir protocolo institucional."),
    adu=B(2, 2, 4, "mL", (24,), None, "1–2 ampolas (2–4 mL) IM/EV lento 1×/dia, conforme apresentação e protocolo."),
    ido=IDO(1, "Sem ajuste."))

P["aas"] = dict(
    neo=B(1, 3, 5, "mg/kg/dia", (24,), None, "Antiagregante (shunts cardíacos): 1–5 mg/kg/dia, sob cardiologista."),
    lac=B(3, 5, 5, "mg/kg/dia", (24,), None, "Antiagregante: 3–5 mg/kg/dia. Kawasaki agudo: 30–50 a 80–100 mg/kg/dia ÷ 6/6 h."),
    cri=B(3, 5, 5, "mg/kg/dia", (24,), None, "Antiagregante: 3–5 mg/kg/dia (máx. 100 mg). Kawasaki agudo: 30–50 a 80–100 mg/kg/dia ÷ 6/6 h. Evitar em viroses (Reye)."),
    adl=B(75, 100, 100, "mg/dia", (24,), None, "Antiagregante: 75–100 mg/dia. Evitar em viroses (Reye)."),
    adu=B(75, 100, 325, "mg", (24,), 325, "Antiagregante: 75–100 mg 1×/dia (máx. 325 mg). SCA: ataque 150–300 mg."),
    ido=IDO(1, "Risco de sangramento gastrointestinal; associar proteção gástrica se indicado."))

P["acido_folico"] = dict(neo=NR("Uso não padronizado com comprimido de 5 mg."),
    lac=B(0.5, 0.5, 0.5, "mg/kg/dia", (24,), None, "Anemia megaloblástica (1 mês–11 anos): 500 mcg/kg 1×/dia (ajustar à apresentação)."),
    cri=B(0.5, 0.5, 0.5, "mg/kg/dia", (24,), None, "Anemia megaloblástica (1 mês–11 anos): 500 mcg/kg 1×/dia (máx. 5 mg). Hemolítica: 2,5–5 mg/dia."),
    adl=B(2.5, 5, 5, "mg/dia", (24,), None, "≥ 12 anos: 5 mg/dia. Anemia hemolítica: 2,5–5 mg/dia."),
    adu=B(5, 5, 15, "mg", (24,), 15, "Deficiência: 5 mg/dia por 4 meses; má-absorção até 15 mg/dia. Prevenção de DTN de alto risco: 5 mg/dia."),
    ido=IDO(1, "Excluir deficiência de B12 antes de tratar."))

P["albendazol_comp"] = dict(neo=NR("Não recomendado."),
    lac=B(200, 200, 200, "mg", None, None, "12–23 meses: 200 mg em dose única."),
    cri=B(400, 400, 400, "mg", (24,), 800, "≥ 2 anos: 400 mg em dose única; estrongiloidíase/teníase: 400 mg/dia por 3 dias. Neurocisticercose: 15 mg/kg/dia ÷ 12/12 h por 8–30 dias (máx. 800 mg/dia)."),
    adl=B(400, 400, 400, "mg", (24,), 800, "400 mg em dose única; 400 mg/dia por 3 dias. Neurocisticercose: 15 mg/kg/dia (máx. 800 mg/dia)."),
    adu=B(400, 400, 400, "mg", (12, 24), 800, "400 mg em dose única; 400 mg/dia por 3 dias. Neurocisticercose: 15 mg/kg/dia ÷ 12/12 h (máx. 800 mg/dia)."),
    ido=IDO(1, "Sem ajuste."))

P["alopurinol"] = dict(neo=NR("Não estabelecido."),
    lac=NR("Dados limitados; seguir protocolo oncológico."),
    cri=B(3, 3.5, 5, "mg/kg", (8, 12), 10, "Lise tumoral: 10 mg/kg/dia ÷ 2–3 (ou 300 mg/m²/dia). < 6 anos: 150 mg/dia; 6–10 anos: 300 mg/dia.", cap=300, capd=800),
    adl=B(100, 300, 400, "mg", (8, 12, 24), 800, "Lise tumoral: 300–800 mg/dia; gota: 100–300 mg/dia."),
    adu=B(100, 300, 400, "mg", (12, 24), 800, "Gota: iniciar 100 mg/dia, aumentar até 300 mg/dia. Lise tumoral: 600–800 mg/dia."),
    ido=IDO(0.5, "Ajustar pelo ClCr; risco de SSJ/NET (HLA-B*58:01); iniciar 50–100 mg/dia."))

P["anlodipino"] = dict(neo=NR("Não estabelecido."),
    lac=NR("Não estabelecido em < 1 ano."),
    cri=B(0.1, 0.1, 0.3, "mg/kg", (24,), 0.6, "1–5 anos: 0,1 mg/kg/dia; ≥ 6 anos: 2,5–5 mg 1×/dia.", cap=10),
    adl=B(2.5, 5, 10, "mg", (24,), 10, "2,5–5 mg 1×/dia (até 10 mg)."),
    adu=B(5, 5, 10, "mg", (24,), 10, "5 mg 1×/dia (máx. 10 mg/dia)."),
    ido=IDO(0.5, "Iniciar com 2,5 mg 1×/dia."))

_azi = B(5, 10, 12, "mg/kg", (24,), None, "10 mg/kg/dia por 3 dias, ou 10 mg/kg no D1 e 5 mg/kg/dia nos D2–5. Faringite: 12 mg/kg/dia por 5 dias.", cap=500)
P["azitromicina_comp"] = dict(
    neo=B(10, 10, 20, "mg/kg", (24,), None, "Coqueluche: 10 mg/kg/dia por 5 dias. Clamídia: 20 mg/kg/dia por 3 dias."),
    lac=_azi, cri=_azi, adl=_azi,
    adu=B(250, 500, 1000, "mg", (24,), None, "500 mg 1×/dia por 3 dias, ou 500 mg no D1 e 250 mg nos D2–5. Clamídia: 1 g em dose única. Risco de QT longo."),
    ido=IDO(1, "Risco de prolongamento de QT."))

_amx = B(12.5, 25, 45, "mg/kg", (8, 12), 90, "25–50 mg/kg/dia ÷ 8–12 h; otite média/pneumonia: 80–90 mg/kg/dia ÷ 12/12 h.", cap=1000, capd=4000)
P["amoxicilina_comp"] = dict(
    neo=B(10, 15, 15, "mg/kg", (12,), 30, "≤ 3 meses: 20–30 mg/kg/dia ÷ 12/12 h."),
    lac=_amx, cri=_amx, adl=_amx,
    adu=B(500, 500, 875, "mg", (8, 12), 4000, "500 mg 8/8 h ou 875 mg 12/12 h (até 4 g/dia em protocolos)."),
    ido=IDO(1, "Ajustar se ClCr < 30."))

_bac = B(0.1, 0.25, 0.5, "mg/kg", (6, 8), 2, "≥ 1 ano: iniciar 0,3 mg/kg/dia ÷ 4 e aumentar até 0,75–2 mg/kg/dia (máx. 40 mg/dia < 8 anos; 60 mg/dia ≥ 8 anos).", cap=20, capd=60)
P["baclofeno"] = dict(neo=NR("Não estabelecido."), lac=NR("Não estabelecido em < 1 ano."), cri=_bac, adl=_bac,
    adu=B(5, 10, 25, "mg", (8,), 80, "Iniciar 5 mg 3×/dia, aumentar a cada 3 dias até 30–80 mg/dia (100 mg/dia em ambiente hospitalar). Retirada gradual."),
    ido=IDO(0.5, "Ajustar pelo ClCr; sedação e confusão."))

P["captopril"] = dict(
    neo=B(0.01, 0.03, 0.05, "mg/kg", (8, 12), 0.15, "0,01–0,05 mg/kg/dose a cada 8–12 h; titular com cautela (risco de hipotensão e oligúria)."),
    lac=B(0.15, 0.3, 0.5, "mg/kg", (8, 12), 6, "0,3–0,5 mg/kg/dose 2–3×/dia (iniciar 0,15 mg/kg); máx. 6 mg/kg/dia."),
    cri=B(0.15, 0.3, 0.5, "mg/kg", (8, 12), 6, "0,3–0,5 mg/kg/dose 2–3×/dia (iniciar 0,15 mg/kg); máx. 6 mg/kg/dia.", cap=150, capd=450),
    adl=B(0.15, 0.3, 0.5, "mg/kg", (8, 12), 6, "0,3–0,5 mg/kg/dose 2–3×/dia.", cap=150, capd=450),
    adu=B(12.5, 25, 50, "mg", (8, 12), 150, "25 mg 2–3×/dia (iniciar 12,5 mg); máx. 150 mg/dia."),
    ido=IDO(0.5, "Iniciar com 6,25–12,5 mg; ajustar pelo ClCr; monitorar potássio."))

P["carbonato_calcio"] = dict(neo=NR("Não usar comprimido."),
    lac=B(11, 14, 16, "mg/kg", (6,), 65, "Hipocalcemia: 45–65 mg/kg/dia de cálcio elementar ÷ 4; ajustar pelo cálcio sérico."),
    cri=B(11, 14, 16, "mg/kg", (6,), 65, "Hipocalcemia: 45–65 mg/kg/dia de cálcio elementar ÷ 4; ajustar pelo cálcio sérico.", capd=2500),
    adl=B(500, 1000, 1500, "mg", (8, 12, 24), 2500, "Suplementação: 500–1.500 mg/dia de cálcio elementar em doses divididas."),
    adu=B(500, 1000, 1500, "mg", (8, 12, 24), 2500, "Suplementação: 500–1.500 mg/dia de Ca elementar em doses divididas (até 2.000–2.500 mg/dia)."),
    ido=IDO(1, "Constipação; separar de levotiroxina, quinolonas e ferro."),
    nota="Doses em cálcio elementar (carbonato de cálcio = 40% de cálcio).")

P["carvedilol"] = dict(neo=NR("Não estabelecido."), lac=NR("Não estabelecido."),
    cri=B(0.05, 0.1, 0.3, "mg/kg", (12,), 1.5, "IC (off-label): 0,05–0,1 mg/kg/dose 12/12 h, titulando até 0,3–0,75 mg/kg/dose.", cap=25, capd=50),
    adl=B(0.05, 0.1, 0.3, "mg/kg", (12,), 1.5, "IC (off-label): 0,05–0,1 mg/kg/dose 12/12 h, titulando.", cap=25, capd=50),
    adu=B(3.125, 6.25, 25, "mg", (12,), 50, "IC: 3,125 mg 12/12 h, dobrar a cada 2 semanas (máx. 25 mg 12/12 h; 50 mg se ≥ 85 kg). HAS: 6,25 mg 12/12 h."),
    ido=IDO(0.5, "Hipotensão ortostática; iniciar na menor dose."))

_cfx = B(6, 10, 25, "mg/kg", (6, 8, 12), 100, "25–50 mg/kg/dia ÷ 6–12 h (até 100 mg/kg/dia em infecção grave).", cap=1000, capd=4000)
P["cefalexina_comp"] = dict(neo=NR("Dados limitados."), lac=_cfx, cri=_cfx, adl=_cfx,
    adu=B(250, 500, 1000, "mg", (6,), 4000, "250–500 mg 6/6 h (até 1 g 6/6 h)."),
    ido=IDO(1, "Ajustar pelo ClCr."))

P["ciprofloxacino_comp"] = dict(neo=NR("Não recomendado."),
    lac=NR("Uso restrito, sem alternativa (risco de artropatia); decisão especializada."),
    cri=B(10, 10, 15, "mg/kg", (12,), 30, "Uso restrito (sem alternativa): 10–15 mg/kg/dose 12/12 h.", cap=500, capd=1500),
    adl=B(10, 10, 15, "mg/kg", (12,), 30, "Uso restrito: 10–15 mg/kg/dose 12/12 h.", cap=500, capd=1500),
    adu=B(250, 500, 750, "mg", (12,), 1500, "250–750 mg 12/12 h; máx. 1,5 g/dia."),
    ido=IDO(0.75, "Ajustar pelo ClCr; risco de tendinopatia, delirium e QT longo."))

P["dipirona_comp"] = dict(neo=NR("Contraindicada."), lac=NR("Contraindicada em comprimido; usar gotas/solução."), cri=NR("Comprimido indicado a partir de 15 anos; em crianças usar gotas/solução."),
    adl=B(500, 500, 1000, "mg", (6,), 4000, "≥ 15 anos: 500–1.000 mg até 4×/dia."),
    adu=B(500, 1000, 1000, "mg", (6, 8), 4000, "500–1.000 mg até 4×/dia (máx. 4 g/dia)."),
    ido=IDO(0.75, "Hipotensão e agranulocitose; reduzir na insuficiência renal."))
