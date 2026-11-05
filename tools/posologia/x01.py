from dsl import B, NR, IDO, DESC, F
P = {}
_R = ["LEX", "BNFC", "ANV"]


def M(n, c, v, ap, cat="Adicionais (hospitalar)"):
    return dict(n=n, c=c, v=v, ap=[{"f": a} for a in ap], cat=cat)


P["citrato_cafeina"] = dict(
    meta=M("Citrato de Cafeína", "Estimulante respiratório (metilxantina)", ["EV", "VO"], ["Solução 20 mg/mL (10 mg/mL de cafeína base)"]),
    pre=B(5, 5, 10, "mg/kg", (24,), None, "Apneia da prematuridade: ataque 20 mg/kg (citrato) 1 vez; manutenção 5–10 mg/kg/dia, 1×/dia (citrato = 2 × cafeína base); nível 5–25 mg/L."),
    neo=B(5, 5, 10, "mg/kg", (24,), None, "Ataque 20 mg/kg (citrato) 1 vez; manutenção 5–10 mg/kg/dia, 1×/dia; monitorar FC (suspender se > 180 bpm) e glicemia."),
    ficha=F("Antagonista não seletivo dos receptores de adenosina A1/A2A e inibidor fraco de fosfodiesterases, aumentando o AMPc e a sensibilidade dos quimiorreceptores ao CO₂.",
            "Estimula o centro respiratório do bulbo, aumenta a contratilidade do diafragma e o volume-minuto, reduzindo as apneias da prematuridade e facilitando a extubação; também tem efeito diurético e taquicardizante.",
            fk="Absorção oral completa; meia-vida de 3–5 dias no prematuro (imaturidade do CYP1A2, até 20–30% excretada inalterada na urina), reduzindo para ~5 h em adultos.",
            fisio="A imaturidade do controle respiratório do prematuro (resposta bifásica à hipóxia, adenosina inibitória) causa apneia central; a cafeína bloqueia essa inibição.",
            pa="Taquicardia, irritabilidade, intolerância alimentar, enterocolite necrosante (associação não comprovada), hiperglicemia; nível tóxico > 40 mg/L; reduzir a dose se ClCr baixo.", r=_R, en="caffeine citrate"))

P["indometacina_inj"] = dict(
    meta=M("Indometacina injetável", "AINE (fechamento do canal arterial)", ["EV"], ["Frasco-ampola 1 mg"]),
    pre=B(0.1, 0.2, 0.2, "mg/kg", (12, 24), None, "Fechamento do PCA: 3 doses a cada 12–24 h (0,2 / 0,1 / 0,1 mg/kg se < 48 h; 0,2 mg/kg × 3 se ≥ 48 h); EV em 20–30 min; monitorar diurese, creatinina e plaquetas."),
    neo=B(0.1, 0.2, 0.2, "mg/kg", (12, 24), None, "Fechamento do PCA: 3 doses a cada 12–24 h (0,2 / 0,1 / 0,1 mg/kg se < 48 h; 0,2 mg/kg × 3 se ≥ 48 h)."),
    ficha=F("Inibe de forma não seletiva as ciclo-oxigenases (COX-1/COX-2), reduzindo a síntese de prostaglandinas, sobretudo PGE2.",
            "No prematuro, a queda de PGE2 (vasodilatadora do canal arterial) permite a constrição do ducto arterioso patente; também reduz fluxo renal, mesentérico e cerebral, explicando seus efeitos adversos.",
            fk="Ligação proteica > 90%; meia-vida muito variável e longa no prematuro (12–20 h ou mais); eliminação renal e biliar.",
            fisio="O canal arterial fecha após o nascimento pela queda de PGE2 e aumento do O₂; no prematuro persiste por menor sensibilidade ao O₂ e maior PGE2.",
            pa="Oligúria, ↑ creatinina, hiponatremia, trombocitopenia, hemorragia, enterocolite necrosante e perfuração intestinal isolada; evitar associação com corticoide; contraindicada em sangramento ativo, ECN e insuficiência renal.", r=_R, en="indomethacin"))

P["ibuprofeno_inj"] = dict(
    meta=M("Ibuprofeno injetável (PCA)", "AINE (fechamento do canal arterial)", ["EV"], ["Solução injetável para infusão"]),
    pre=B(5, 10, 10, "mg/kg", (24,), None, "Fechamento do PCA: 10 mg/kg, depois 5 mg/kg após 24 e 48 h; infundir em 15 min; monitorar diurese e creatinina."),
    neo=B(5, 10, 10, "mg/kg", (24,), None, "Fechamento do PCA: 10 mg/kg, depois 5 mg/kg após 24 e 48 h."),
    ficha=F("Inibe de forma não seletiva as ciclo-oxigenases (COX-1/COX-2), diminuindo a síntese de prostaglandinas.",
            "No prematuro, reduz a PGE2 que mantém o canal arterial aberto, causando sua constrição, com menor redução do fluxo mesentérico e cerebral que a indometacina.",
            fk="Ligação proteica > 95% (desloca bilirrubina da albumina); meia-vida ≈ 30–40 h no prematuro; eliminação renal.",
            fisio="Fechamento do ducto arterioso depende de queda das prostaglandinas e é mais difícil quanto menor a idade gestacional.",
            pa="Oligúria transitória, ↑ creatinina, hemorragia pulmonar, hiperbilirrubinemia (deslocamento da albumina), ECN; evitar na hipertensão pulmonar persistente e em ducto dependente.", r=_R, en="ibuprofen lysine"))

P["alprostadil"] = dict(
    meta=M("Alprostadil (Prostaglandina E1)", "Vasodilatador (manutenção do canal arterial)", ["EV"], ["Ampola 500 mcg/mL"]),
    pre=B(0.01, 0.05, 0.1, "mcg/kg/min", None, None, "Cardiopatia congênita ducto-dependente: iniciar 0,05–0,1 mcg/kg/min e reduzir para a menor dose eficaz (0,01–0,05); apneia em até 12 h de uso."),
    neo=B(0.01, 0.05, 0.1, "mcg/kg/min", None, None, "Cardiopatia ducto-dependente: iniciar 0,05–0,1 mcg/kg/min e reduzir para a menor dose eficaz (0,01–0,05); ter ventilação disponível (apneia)."),
    ficha=F("Análogo da prostaglandina E1: ativa receptores EP no músculo liso, aumentando o AMPc e relaxando-o.",
            "Mantém aberto (ou reabre) o canal arterial em recém-nascidos com cardiopatias dependentes do ducto (atresia pulmonar, coarctação crítica, transposição), preservando fluxo pulmonar ou sistêmico até a cirurgia.",
            fk="Metabolismo pulmonar de primeira passagem (> 70–90% em um circuito); meia-vida de 5–10 min; precisa de infusão contínua.",
            fisio="O canal arterial permanece aberto pela PGE2 placentária/endógena e fecha após o parto; o alprostadil mimetiza essa PGE2.",
            pa="Apneia (até 10–12% em < 2 kg), febre, hipotensão, convulsão, hiperostose cortical com uso prolongado, obstrução do trato de saída gástrico; infundir por acesso exclusivo.", r=["LEX", "AHA"], en="alprostadil"))

P["milrinona"] = dict(
    meta=M("Milrinona", "Inotrópico vasodilatador (inibidor da PDE3)", ["EV"], ["Ampola 1 mg/mL"]),
    neo=B(0.2, 0.4, 0.75, "mcg/kg/min", None, None, "Infusão 0,2–0,75 mcg/kg/min; ataque de 50 mcg/kg em 30–60 min é opcional (risco de hipotensão)."),
    lac=B(0.25, 0.5, 0.75, "mcg/kg/min", None, None, "Ataque opcional 50 mcg/kg em 10–60 min; manutenção 0,25–0,75 mcg/kg/min; reduzir na insuficiência renal."),
    cri=B(0.25, 0.5, 0.75, "mcg/kg/min", None, None, "Ataque opcional 50 mcg/kg em 10–60 min; manutenção 0,25–0,75 mcg/kg/min."),
    adl=B(0.25, 0.5, 0.75, "mcg/kg/min", None, None, "Ataque opcional 50 mcg/kg; manutenção 0,25–0,75 mcg/kg/min."),
    adu=B(0.25, 0.5, 0.75, "mcg/kg/min", None, None, "Ataque opcional 50 mcg/kg em 10 min; manutenção 0,375–0,75 mcg/kg/min; reduzir pelo ClCr."),
    ido=IDO(1, "Ajustar pelo ClCr; risco de hipotensão e arritmia."),
    ficha=F("Inibe a fosfodiesterase-3, impedindo a degradação do AMPc em miocárdio e músculo liso vascular.",
            "O AMPc aumentado eleva o Ca²⁺ intracelular no miócito (inotropismo positivo e lusitropismo) e relaxa a musculatura vascular (↓ pós-carga e pressão pulmonar), sem depender de receptores β; útil no baixo débito pós-cirúrgico e em hipertensão pulmonar.",
            fk="Meia-vida ≈ 2–4 h (maior em lactentes e na insuficiência renal); eliminação renal, 80% inalterada.",
            fisio="No baixo débito, a vasoconstrição compensatória eleva a pós-carga; combinar inotropia e vasodilatação melhora o débito sem aumentar tanto o consumo de O₂.",
            pa="Hipotensão, arritmias, trombocitopenia; acumula na insuficiência renal; incompatível com furosemida na mesma linha.", r=["LEX", "AHA"], en="milrinone"))

P["vasopressina"] = dict(
    meta=M("Vasopressina (Arginina-vasopressina)", "Vasopressor / Hormônio antidiurético", ["EV"], ["Ampola 20 UI/mL"]),
    neo=B(0.018, 0.036, 0.12, "UI/kg/h", None, None, "Choque vasodilatado refratário (dados limitados): 0,0003–0,002 UI/kg/min (0,018–0,12 UI/kg/h)."),
    lac=B(0.018, 0.06, 0.12, "UI/kg/h", None, None, "Choque vasodilatado: 0,0003–0,002 UI/kg/min (0,018–0,12 UI/kg/h)."),
    cri=B(0.018, 0.06, 0.12, "UI/kg/h", None, None, "Choque vasodilatado: 0,0003–0,002 UI/kg/min (0,018–0,12 UI/kg/h)."),
    adl=B(0.018, 0.06, 0.12, "UI/kg/h", None, None, "Choque vasodilatado: 0,0003–0,002 UI/kg/min (0,018–0,12 UI/kg/h)."),
    adu=B(0.6, 1.8, 2.4, "UI/h", None, None, "Choque séptico: 0,03 UI/min (1,8 UI/h) fixa, em associação com noradrenalina; faixa 0,01–0,04 UI/min."),
    ido=IDO(1, "Risco de isquemia mesentérica/periférica."),
    ficha=F("Agonista dos receptores V1 (vasculares), V2 (renais) e V1b: o V1 ativa a fosfolipase C e eleva o Ca²⁺ do músculo liso, causando vasoconstrição independente de catecolaminas.",
            "Restaura o tônus vascular no choque vasodilatado em que há deficiência relativa de vasopressina e hiporresponsividade às catecolaminas, poupando noradrenalina; no V2 promove retenção de água (base do uso no diabetes insípido).",
            fk="Meia-vida ≈ 10–20 min; clivagem por vasopressinases hepáticas e renais; infusão contínua.",
            fisio="No choque séptico prolongado as reservas de vasopressina hipofisária se esgotam, contribuindo para a vasoplegia.",
            pa="Isquemia digital/mesentérica/coronariana, hiponatremia, ↓ débito cardíaco em altas doses; não titular acima de 0,04 UI/min no adulto.", r=["SSC", "SSCP", "LEX"], en="vasopressin"))

P["nitroglicerina_inj"] = dict(
    meta=M("Nitroglicerina injetável", "Vasodilatador (nitrato)", ["EV"], ["Ampola 5 mg/mL"]),
    lac=B(0.25, 1, 10, "mcg/kg/min", None, None, "Iniciar 0,25–0,5 mcg/kg/min e titular a cada 15–20 min (usual 1–5; máx. 10)."),
    cri=B(0.25, 1, 10, "mcg/kg/min", None, None, "Iniciar 0,25–0,5 mcg/kg/min e titular a cada 15–20 min (usual 1–5; máx. 10)."),
    adl=B(0.25, 1, 10, "mcg/kg/min", None, None, "Iniciar 0,25–0,5 mcg/kg/min e titular (usual 1–5; máx. 10)."),
    adu=B(5, 20, 200, "mcg/min", None, None, "Iniciar 5–10 mcg/min; aumentar 5–10 mcg/min a cada 3–5 min até o efeito (máx. 200 mcg/min)."),
    ido=IDO(0.5, "Iniciar na menor dose; risco de hipotensão."),
    ficha=F("Doador de óxido nítrico (NO): ativa a guanilil-ciclase solúvel, eleva o GMPc e relaxa o músculo liso vascular.",
            "Em doses baixas dilata sobretudo as veias (↓ pré-carga e consumo de O₂ do miocárdio); em doses maiores dilata artérias (↓ pós-carga) e coronárias, aliviando a isquemia, a congestão pulmonar e a hipertensão perioperatória.",
            fk="Metabolismo hepático e extra-hepático muito rápido; meia-vida de 1–4 min; adere a PVC (usar frascos de vidro/equipos próprios).",
            fisio="A tolerância (taquifilaxia) aparece em 24–48 h de infusão contínua, exigindo escalonar a dose.",
            pa="Hipotensão, cefaleia, taquicardia reflexa, meta-hemoglobinemia em altas doses; contraindicada com inibidores de PDE5 e hipertensão intracraniana.", r=["LEX", "AHA"], en="nitroglycerin"))

P["nitroprussiato"] = dict(
    meta=M("Nitroprussiato de Sódio", "Vasodilatador (doador de NO)", ["EV"], ["Ampola 50 mg"]),
    neo=B(0.3, 0.5, 2, "mcg/kg/min", None, None, "Uso restrito (dados limitados): iniciar 0,3–0,5 mcg/kg/min; risco de cianeto."),
    lac=B(0.3, 1, 8, "mcg/kg/min", None, None, "Iniciar 0,3–0,5 mcg/kg/min; usual 1–4; máx. 8–10 por curto período (cianeto/tiocianato); proteger da luz."),
    cri=B(0.3, 1, 8, "mcg/kg/min", None, None, "Iniciar 0,3–0,5 mcg/kg/min; usual 1–4; máx. 8–10 por curto período (cianeto/tiocianato); proteger da luz."),
    adl=B(0.3, 1, 8, "mcg/kg/min", None, None, "Iniciar 0,3 mcg/kg/min; usual 1–4; máx. 8–10 por curto período."),
    adu=B(0.3, 1, 10, "mcg/kg/min", None, None, "Iniciar 0,3 mcg/kg/min; usual 0,5–4; máx. 10 mcg/kg/min por ≤ 10 min; monitorar PA invasiva."),
    ido=IDO(0.7, "Menor dose inicial; risco de hipotensão grave."),
    ficha=F("Doador direto de óxido nítrico: eleva o GMPc no músculo liso e provoca relaxamento arterial e venoso equilibrado.",
            "Reduz a pré e a pós-carga com início em segundos, permitindo titulação fina da pressão em crise hipertensiva, dissecção de aorta, hipertensão perioperatória e insuficiência cardíaca aguda.",
            fk="Meia-vida de 2 min; metabolizado em cianeto (convertido em tiocianato no fígado, excreção renal; meia-vida do tiocianato ≈ 3 dias).",
            fisio="A liberação de 5 CN⁻ por molécula limita dose e duração; a insuficiência renal e hepática acentuam a toxicidade.",
            pa="Hipotensão, taquicardia reflexa, intoxicação por cianeto/tiocianato (acidose, confusão), roubo coronariano; proteger da luz e usar linha exclusiva; contraindicada na coarctação e na atrofia óptica.", r=["LEX", "AHA"], en="sodium nitroprusside"))

P["bicarbonato_sodio"] = dict(
    meta=M("Bicarbonato de Sódio", "Alcalinizante", ["EV"], ["Ampola 8,4% (1 mEq/mL) 10 mL", "Solução 4,2% (0,5 mEq/mL)"]),
    neo=B(1, 1, 2, "mEq/kg", None, None, "Acidose metabólica grave/PCR: 1–2 mEq/kg de solução 4,2% (0,5 mEq/mL), lento (≤ 0,5 mEq/kg/min); só com ventilação adequada."),
    lac=B(1, 1, 1, "mEq/kg", None, None, "PCR/acidose grave: 1 mEq/kg (diluir 8,4% 1:1 em < 2 anos), EV lento; déficit de base × 0,3 × kg, repor metade."),
    cri=B(1, 1, 1, "mEq/kg", None, None, "PCR/acidose grave: 1 mEq/kg EV lento (máx. 50 mEq); déficit de base × 0,3 × kg, repor metade.", cap=50),
    adl=B(1, 1, 1, "mEq/kg", None, None, "PCR/acidose grave: 1 mEq/kg EV lento (máx. 50 mEq).", cap=50),
    adu=B(50, 50, 100, "mEq", None, None, "Acidose grave/hipercalemia/intoxicação por bloqueadores de Na⁺: 50–100 mEq EV (1 mEq/kg); não rotineiro na PCR."),
    ido=IDO(1, "Risco de sobrecarga de sódio/volume e hipocalemia."),
    ficha=F("Ânion base (HCO₃⁻) que tampona prótons livres, formando H₂CO₃ → CO₂ + H₂O; o CO₂ é eliminado pelos pulmões.",
            "Eleva o pH sanguíneo em acidose metabólica grave, hipercalemia, intoxicações (antidepressivos tricíclicos, salicilato, bloqueadores de Na⁺) e alcaliniza urina para excreção de salicilato; só é eficaz se a ventilação elimina o CO₂ produzido.",
            fk="Distribuição no extracelular; titulação conforme gasometria; excreção renal do excesso.",
            fisio="A acidose intracelular paradoxal pode piorar se o CO₂ gerado não for ventilado; na PCR o benefício é incerto.",
            pa="Hipernatremia, hiperosmolaridade (hemorragia intraventricular no prematuro com infusão rápida de 8,4%), hipocalemia, hipocalcemia ionizada, alcalose; incompatível com cálcio e catecolaminas na mesma linha; extravasamento causa necrose.", r=["AHA", "NRP", "LEX"], en="sodium bicarbonate"))

P["aminofilina"] = dict(
    meta=M("Aminofilina", "Broncodilatador (metilxantina)", ["EV"], ["Ampola 24 mg/mL"]),
    neo=B(5, 5.5, 6, "mg/kg", None, None, "Apneia: ataque 5–6 mg/kg EV em 20–30 min, depois 1–2 mg/kg a cada 8–12 h (aminofilina = 80% de teofilina)."),
    lac=B(5, 5, 6, "mg/kg", None, None, "Asma grave: ataque 5–6 mg/kg em 20–30 min (omitir se uso prévio); manutenção 0,5–1 mg/kg/h; nível 10–20 mg/L.", cap=500),
    cri=B(5, 5, 6, "mg/kg", None, None, "Asma grave: ataque 5–6 mg/kg em 20–30 min (omitir se uso prévio); manutenção 0,8–1 mg/kg/h; nível 10–20 mg/L.", cap=500),
    adl=B(5, 5, 6, "mg/kg", None, None, "Ataque 5–6 mg/kg em 20–30 min; manutenção 0,5–0,8 mg/kg/h; nível 10–20 mg/L.", cap=500),
    adu=B(5, 5, 6, "mg/kg", None, None, "Ataque 5–6 mg/kg (peso ideal) em 20–30 min; manutenção 0,3–0,5 mg/kg/h; nível 10–20 mg/L.", cap=500),
    ido=IDO(1, "Reduzir a manutenção (0,3 mg/kg/h); dosar nível sérico."),
    ficha=F("Inibe fosfodiesterases (↑ AMPc) e antagoniza receptores de adenosina, relaxando o músculo liso brônquico e estimulando o centro respiratório e o diafragma.",
            "Broncodilatação e melhora da contratilidade diafragmática em asma grave refratária e DPOC; tratamento da apneia do prematuro. Janela terapêutica estreita e múltiplas interações.",
            fk="Metabolismo hepático (CYP1A2, 2E1, 3A4) com cinética saturável; meia-vida muito variável (prematuro 20–30 h, lactente 4–5 h, criança 3–4 h, adulto 7–9 h, mais longa com insuficiência cardíaca/hepática).",
            fisio="A adenosina induz broncoconstrição e inibe a respiração; seu bloqueio explica os efeitos terapêuticos e a estimulação do SNC.",
            pa="Taquiarritmias, convulsões, náuseas/vômitos, hipocalemia; interações (ciprofloxacino, macrolídeos, cimetidina elevam o nível; tabagismo reduz).", r=_R, en="aminophylline"))

P["terbutalina_inj"] = dict(
    meta=M("Terbutalina injetável", "Broncodilatador (β2-agonista)", ["SC", "EV"], ["Ampola 0,5 mg/mL"]),
    lac=B(5, 10, 10, "mcg/kg", None, None, "Asma grave: 10 mcg/kg EV em 10 min (máx. 250 mcg) ou SC 0,01 mg/kg a cada 20 min até 3×; infusão 0,1–10 mcg/kg/min.", cap=250),
    cri=B(5, 10, 10, "mcg/kg", None, None, "Asma grave: 10 mcg/kg EV em 10 min (máx. 250 mcg) ou SC 0,01 mg/kg a cada 20 min até 3×; infusão 0,1–10 mcg/kg/min.", cap=250),
    adl=B(5, 10, 10, "mcg/kg", None, None, "SC 0,01 mg/kg (máx. 0,25 mg) a cada 20 min até 3×.", cap=250),
    adu=B(0.25, 0.25, 0.25, "mg", None, None, "0,25 mg SC, repetir em 15–30 min (máx. 0,5 mg em 4 h)."),
    ido=IDO(0.5, "Taquiarritmias e hipocalemia."),
    ficha=F("Agonista β2-adrenérgico seletivo: ativa a adenilil-ciclase, eleva o AMPc e relaxa o músculo liso brônquico e uterino.",
            "Broncodilatação rápida em asma grave refratária, quando a via inalatória é insuficiente; também tem ação tocolítica (uso restrito pelo risco materno).",
            fk="Início em 5 min (SC) e 15 min; duração 1,5–4 h; eliminação renal e hepática.",
            fisio="Na crise asmática grave o broncoespasmo e o muco limitam a entrega inalatória; vias sistêmicas alcançam o músculo liso pela circulação.",
            pa="Taquicardia, tremor, hipocalemia, hiperglicemia, acidose láctica; ECG e potássio na infusão; alerta da FDA contra uso prolongado como tocolítico.", r=["LEX", "GINA"], en="terbutaline"))

P["acetazolamida"] = dict(
    meta=M("Acetazolamida", "Diurético (inibidor da anidrase carbônica)", ["VO", "EV"], ["Comprimido 250 mg", "Frasco-ampola 500 mg"]),
    lac=B(5, 15, 30, "mg/kg/dia", (6, 8, 12), 30, "Glaucoma: 8–30 mg/kg/dia ÷ 6–8 h; diurético: 5 mg/kg/dia; hidrocefalia: 20–100 mg/kg/dia (especialista); máx. 1 g/dia.", capd=1000),
    cri=B(5, 15, 30, "mg/kg/dia", (6, 8, 12), 30, "Glaucoma: 8–30 mg/kg/dia ÷ 6–8 h; diurético: 5 mg/kg/dia; máx. 1 g/dia.", capd=1000),
    adl=B(5, 15, 30, "mg/kg/dia", (6, 8, 12), 30, "Glaucoma: 8–30 mg/kg/dia; máx. 1 g/dia.", capd=1000),
    adu=B(250, 500, 1000, "mg/dia", (6, 8, 12, 24), 1000, "Glaucoma: 250–1.000 mg/dia ÷; edema: 250–375 mg/dia; profilaxia de altitude: 250 mg 12/12 h."),
    ido=IDO(0.5, "Risco de acidose, hipocalemia e confusão; ajustar pelo ClCr."),
    ficha=F("Inibe a anidrase carbônica (enzima que catalisa CO₂ + H₂O ⇌ H₂CO₃) no túbulo proximal renal, no plexo coroide e no corpo ciliar.",
            "No rim, reduz a reabsorção de bicarbonato e sódio (diurese alcalina, acidose metabólica hiperclorêmica); no olho e no plexo coroide, reduz a produção de humor aquoso e líquor, baixando a pressão intraocular e a PIC; a acidose leve estimula a ventilação (profilaxia da doença de altitude).",
            fk="Absorção oral boa; meia-vida ≈ 6–9 h; excreção renal inalterada, com ajuste na insuficiência renal.",
            fisio="A anidrase carbônica gera H⁺ e HCO₃⁻ nos tecidos secretores; inibi-la reduz a secreção de fluidos.",
            pa="Acidose metabólica, hipocalemia, parestesias, cálculo renal, contraindicada em alergia a sulfonamidas, hiponatremia e hepatopatia grave.", r=_R, en="acetazolamide"))

P["tiamina_inj"] = dict(
    meta=M("Tiamina (Vitamina B1) injetável", "Vitamina (B1)", ["EV", "IM"], ["Ampola 100 mg/mL"]),
    lac=B(10, 25, 50, "mg", (24,), None, "Beribéri/deficiência: 10–25 mg/dia IM/EV (até 50 mg)."),
    cri=B(10, 25, 50, "mg", (24,), None, "Beribéri/deficiência: 10–25 mg/dia IM/EV (até 50 mg)."),
    adl=B(50, 100, 500, "mg", (8, 24), None, "Deficiência: 50–100 mg/dia; Wernicke: 500 mg EV 3×/dia por 2–3 dias."),
    adu=B(100, 500, 500, "mg", (8, 24), None, "Deficiência/profilaxia: 100 mg/dia; Wernicke: 500 mg EV 3×/dia por 2–3 dias, depois 250 mg/dia por 3–5 dias."),
    ido=IDO(1, "Mesma dose; administrar antes da glicose em risco de Wernicke."),
    ficha=F("Precursor da tiamina-pirofosfato (TPP), cofator essencial da piruvato-desidrogenase, α-cetoglutarato-desidrogenase e transcetolase.",
            "Permite o metabolismo oxidativo da glicose e a via das pentoses; sua deficiência bloqueia o ciclo de Krebs, causando acidose láctica, insuficiência cardíaca (beribéri úmido) e lesão neuronal (encefalopatia de Wernicke).",
            fk="Hidrossolúvel, pouco armazenada (reservas de ≈ 2–3 semanas); excreção renal rápida do excesso.",
            fisio="Em jejum prolongado, etilismo, hiperêmese e nutrição parenteral, a oferta de glicose sem tiamina consome as reservas e precipita Wernicke.",
            pa="Reação anafilática rara com a via EV (infundir lentamente em 30 min); doses altas são seguras na prática.", r=_R, en="thiamine"))

P["protamina"] = dict(
    meta=M("Sulfato de Protamina", "Antídoto da heparina", ["EV"], ["Ampola 10 mg/mL"]),
    neo=DESC("1 mg neutraliza ≈ 100 UI de heparina circulante nas últimas 2–4 h (máx. 50 mg/dose); infundir lentamente (≤ 5 mg/min)."),
    lac=DESC("1 mg neutraliza ≈ 100 UI de heparina circulante nas últimas 2–4 h (máx. 50 mg/dose); infundir lentamente (≤ 5 mg/min)."),
    cri=DESC("1 mg neutraliza ≈ 100 UI de heparina circulante nas últimas 2–4 h (máx. 50 mg/dose); infundir lentamente (≤ 5 mg/min)."),
    adl=DESC("1 mg neutraliza ≈ 100 UI de heparina circulante nas últimas 2–4 h (máx. 50 mg/dose); infundir lentamente (≤ 5 mg/min)."),
    adu=DESC("1 mg neutraliza ≈ 100 UI de heparina circulante nas últimas 2–4 h (máx. 50 mg/dose); infundir ≤ 5 mg/min; enoxaparina: 1 mg por 1 mg (neutralização parcial)."),
    ido=DESC("Mesmo esquema do adulto; infundir lentamente."),
    ficha=F("Proteína catiônica (rica em arginina) que se liga eletrostaticamente à heparina aniônica, formando um complexo estável sem atividade anticoagulante.",
            "Reverte rapidamente o efeito anticoagulante da heparina não fracionada (e parcialmente o da enoxaparina); em excesso, a própria protamina tem efeito anticoagulante fraco.",
            fk="Início em 5 min; meia-vida de cerca de 7 min, menor que a de muitas heparinas (considerar rebote).",
            fisio="A dose depende da heparina residual (meia-vida da heparina ≈ 60–90 min), evitando excesso de protamina.",
            pa="Hipotensão, bradicardia, broncoconstrição, hipertensão pulmonar e anafilaxia (risco maior em diabéticos em uso de NPH, alergia a peixe, vasectomia); infusão lenta.", r=["LEX", "ANV"], en="protamine sulfate"))

P["digoxina"] = dict(
    meta=M("Digoxina", "Cardiotônico (glicosídeo)", ["VO", "EV"], ["Comprimido 0,25 mg", "Elixir 0,05 mg/mL", "Ampola 0,25 mg/mL"]),
    pre=B(4, 5, 6, "mcg/kg/dia", (12,), None, "Manutenção 4–6 mcg/kg/dia ÷ 12/12 h (ataque total 20 mcg/kg em 3 doses); ECG, K⁺ e nível 0,5–2 ng/mL."),
    neo=B(5, 7, 8, "mcg/kg/dia", (12,), None, "A termo: ataque 20–30 mcg/kg; manutenção 5–8 mcg/kg/dia ÷ 12/12 h."),
    lac=B(8, 10, 12, "mcg/kg/dia", (12,), None, "Ataque 30–50 mcg/kg; manutenção 8–12 mcg/kg/dia ÷ 12/12 h."),
    cri=B(5, 7.5, 10, "mcg/kg/dia", (12,), None, "Ataque 25–40 mcg/kg; manutenção 5–10 mcg/kg/dia ÷ 12/12 h (máx. 250 mcg/dia).", capd=250),
    adl=B(2.5, 3.5, 5, "mcg/kg/dia", (24,), None, "Ataque 10–15 mcg/kg; manutenção 2,5–5 mcg/kg/dia (máx. 250 mcg/dia).", capd=250),
    adu=B(62.5, 125, 250, "mcg/dia", (24,), 250, "Ataque 0,5–1 mg EV dividido; manutenção 0,125–0,25 mg/dia; ajustar ao ClCr; nível 0,5–1 ng/mL."),
    ido=IDO(0.5, "Ajustar pelo ClCr (62,5–125 mcg/dia); toxicidade com hipocalemia/hipomagnesemia."),
    ficha=F("Inibe a Na⁺/K⁺-ATPase da membrana do miócito, elevando o Na⁺ intracelular e, via trocador Na⁺/Ca²⁺, o Ca²⁺ intracelular; aumenta também o tônus vagal.",
            "Inotropismo positivo (↑ contratilidade) e redução da condução no nó AV (controle da frequência na fibrilação atrial), com pouco efeito sobre a mortalidade na insuficiência cardíaca.",
            fk="Biodisponibilidade oral ≈ 70–80% (comprimido), elixir ≈ 75%; Vd ≈ 5–7 L/kg; meia-vida ≈ 36–48 h; excreção renal inalterada (ajuste obrigatório pelo ClCr).",
            fisio="A janela terapêutica é estreita e a toxicidade é potenciada por hipocalemia, hipomagnesemia, hipercalcemia e insuficiência renal.",
            pa="Intoxicação (náuseas, visão amarelada, bloqueios, arritmias, bradicardia); interação com amiodarona, verapamil, macrolídeos (↑ nível); antídoto: fragmento Fab de anticorpo anti-digoxina.", r=["LEX", "BNFC", "BNF"], en="digoxin"))

P["labetalol"] = dict(
    meta=M("Labetalol", "Anti-hipertensivo (bloqueador α1/β)", ["EV"], ["Ampola 5 mg/mL"]),
    lac=B(0.2, 0.5, 1, "mg/kg", None, None, "Crise hipertensiva: 0,2–1 mg/kg EV em bolus lento (máx. 40 mg); infusão 0,25–3 mg/kg/h.", cap=40),
    cri=B(0.2, 0.5, 1, "mg/kg", None, None, "Crise hipertensiva: 0,2–1 mg/kg EV em bolus lento (máx. 40 mg); infusão 0,25–3 mg/kg/h.", cap=40),
    adl=B(0.2, 0.5, 1, "mg/kg", None, None, "Crise hipertensiva: 0,2–1 mg/kg EV em bolus lento (máx. 40 mg); infusão 0,25–3 mg/kg/h.", cap=40),
    adu=B(20, 40, 80, "mg", None, None, "20 mg EV em 2 min; repetir 40–80 mg a cada 10 min (máx. 300 mg); infusão 0,5–2 mg/min. Pré-eclâmpsia: 20 mg, depois 40–80 mg."),
    ido=IDO(0.5, "Iniciar com doses menores; risco de bradicardia e hipotensão ortostática."),
    ficha=F("Bloqueador competitivo dos receptores β1/β2 e α1 (razão β:α ≈ 7:1 por via EV).",
            "Reduz a pressão arterial por vasodilatação α1 e redução do débito/frequência cardíaca β, sem taquicardia reflexa importante; início em 2–5 min, sendo útil em crise hipertensiva, pré-eclâmpsia e hipertensão perioperatória.",
            fk="Meia-vida ≈ 5,5 h; metabolismo hepático (glicuronidação) de primeira passagem intenso; duração EV de 2–4 h.",
            fisio="O bloqueio α evita a queda do débito observada com β-bloqueadores puros, preservando o fluxo periférico.",
            pa="Hipotensão ortostática, bradicardia, broncoespasmo (evitar em asma grave), bloqueio AV, hepatotoxicidade rara; evitar em insuficiência cardíaca descompensada e bradiarritmias.", r=["LEX", "BNFC", "BNF"], en="labetalol"))
