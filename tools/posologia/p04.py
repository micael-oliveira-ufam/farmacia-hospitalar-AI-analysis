from dsl import B, NR, IDO
from p02 import P as P2
from p03 import P as P3
P = {}


def _cp(src, nota=None):
    r = dict(src)
    if nota:
        r["nota"] = nota
    return r


P["espironolactona"] = dict(
    neo=B(1, 2, 3, "mg/kg/dia", (12, 24), 3, "1–3 mg/kg/dia ÷ 1–2 doses."),
    lac=B(1, 2, 3, "mg/kg/dia", (12, 24), 3.3, "1–3 mg/kg/dia ÷ 1–2 doses; monitorar potássio."),
    cri=B(1, 2, 3, "mg/kg/dia", (12, 24), 3.3, "1–3 mg/kg/dia ÷ 1–2 doses; monitorar potássio.", capd=100),
    adl=B(1, 2, 3, "mg/kg/dia", (12, 24), 3.3, "1–3 mg/kg/dia ÷ 1–2 doses; monitorar potássio.", capd=100),
    adu=B(12.5, 50, 400, "mg/dia", (12, 24), 400, "IC: 12,5–50 mg/dia; edema: 25–200 mg/dia; ascite: 100–400 mg/dia."),
    ido=IDO(0.5, "Hiperpotassemia; ajustar pelo ClCr; iniciar 12,5–25 mg/dia."))

_ibu = lambda cap: B(5, 7.5, 10, "mg/kg", (6, 8), 40, "5–10 mg/kg/dose a cada 6–8 h (≥ 6 meses). Evitar em desidratação e nefropatia.", cap=cap, capd=2400)
P["ibuprofeno_comp"] = dict(neo=NR("Não usar."),
    lac=B(5, 7.5, 10, "mg/kg", (6, 8), 40, "Apenas ≥ 6 meses (não usar < 3 meses): 5–10 mg/kg/dose a cada 6–8 h.", cap=400, capd=1200),
    cri=_ibu(400), adl=_ibu(600),
    adu=B(200, 400, 600, "mg", (6, 8), 2400, "200–400 mg a cada 6–8 h (até 600 mg em dor inflamatória); máx. 2,4 g/dia (3,2 g/dia sob supervisão)."),
    ido=IDO(0.5, "Risco renal, gastrointestinal e cardiovascular; menor dose pelo menor tempo."))

P["fluconazol_comp"] = _cp(P2["fluconazol_inj"])

P["hidroclorotiazida"] = dict(
    neo=B(1, 1.5, 2, "mg/kg/dia", (12,), 4, "1–2 mg/kg/dia ÷ 12/12 h."),
    lac=B(1, 1, 2, "mg/kg/dia", (24,), 2, "1 mg/kg/dia (máx. 2 mg/kg/dia).", capd=37.5),
    cri=B(1, 1, 2, "mg/kg/dia", (12, 24), 2, "1–2 mg/kg/dia em 1–2 doses.", capd=100),
    adl=B(1, 1, 2, "mg/kg/dia", (12, 24), 2, "1–2 mg/kg/dia em 1–2 doses.", capd=100),
    adu=B(12.5, 25, 100, "mg/dia", (12, 24), 100, "HAS: 12,5–25 mg/dia (máx. 50); edema: 25–100 mg/dia."),
    ido=IDO(0.5, "Hiponatremia e hipocalemia; iniciar 12,5 mg/dia."))

P["hidralazina_comp"] = dict(neo=NR("Via oral não estabelecida."),
    lac=B(0.75, 1.5, 3, "mg/kg/dia", (6, 8, 12), 7.5, "Iniciar 0,75 mg/kg/dia ÷ 4 doses e titular em 3–4 dias; máx. 7,5 mg/kg/dia."),
    cri=B(0.75, 1.5, 3, "mg/kg/dia", (6, 8, 12), 7.5, "Iniciar 0,75 mg/kg/dia ÷ 4 doses e titular; máx. 7,5 mg/kg/dia.", capd=200),
    adl=B(0.75, 1.5, 3, "mg/kg/dia", (6, 8, 12), 7.5, "Iniciar 0,75 mg/kg/dia ÷ 4 doses e titular; máx. 7,5 mg/kg/dia.", capd=200),
    adu=B(10, 25, 50, "mg", (6,), 200, "10 mg 4×/dia por 2–4 dias, depois 25 mg 4×/dia; máx. 200 mg/dia."),
    ido=IDO(0.5, "Hipotensão e taquicardia reflexa; iniciar com 10 mg 2–3×/dia."))

P["ivermectina"] = dict(neo=NR("Contraindicada."), lac=NR("Não recomendada em < 15 kg."),
    cri=B(150, 200, 200, "mcg/kg", None, None, "≥ 15 kg: 200 mcg/kg em dose única; escabiose: repetir em 7–14 dias."),
    adl=B(150, 200, 200, "mcg/kg", None, None, "200 mcg/kg em dose única; escabiose: repetir em 7–14 dias."),
    adu=B(150, 200, 400, "mcg/kg", None, None, "200 mcg/kg em dose única (até 400 mcg/kg em protocolos específicos)."),
    ido=IDO(1, "Sem ajuste."))

P["levotiroxina"] = dict(
    neo=B(10, 12.5, 15, "mcg/kg/dia", (24,), None, "Hipotireoidismo congênito: 10–15 mcg/kg/dia, iniciar até 2 semanas de vida; guiar por TSH/T4 livre."),
    lac=B(5, 8, 15, "mcg/kg/dia", (24,), None, "0–3 meses: 10–15; 3–6 meses: 8–10; 6–12 meses: 6–8; 1–2 anos: 5–6 mcg/kg/dia. Ajustar por TSH/T4 livre."),
    cri=B(4, 5, 6, "mcg/kg/dia", (24,), None, "1–5 anos: 5–6; 6–12 anos: 4–5 mcg/kg/dia. Ajustar por TSH/T4 livre."),
    adl=B(2, 2.5, 3, "mcg/kg/dia", (24,), None, "> 12 anos: 2–3 mcg/kg/dia (1,6 se crescimento completo). Ajustar por TSH/T4 livre."),
    adu=B(1.6, 1.6, 1.6, "mcg/kg/dia", (24,), None, "Reposição plena: 1,6 mcg/kg/dia; iniciar 25–50 mcg/dia em cardiopatas. Habitualmente ≤ 200–300 mcg/dia.", capd=300),
    ido=IDO(0.75, "Iniciar com 12,5–25 mcg/dia e titular lentamente (risco cardíaco)."))

_los = B(0.7, 0.7, 1.4, "mg/kg", (24,), 1.4, "≥ 6 anos: 0,7 mg/kg 1×/dia (até 50 mg); máx. 1,4 mg/kg/dia.", cap=100, capd=100)
P["losartana"] = dict(neo=NR("Não recomendado."), lac=NR("Não recomendada em < 6 anos."),
    cri=_los, adl=_los,
    adu=B(25, 50, 100, "mg", (24,), 100, "50 mg 1×/dia (iniciar 25 mg se hipovolêmico); máx. 100 mg/dia (150 mg na IC)."),
    ido=IDO(0.5, "Hiperpotassemia e piora da função renal; iniciar 25 mg."))

P["metronidazol_comp"] = _cp(P2["metronidazol_inj"])

_om = B(0.7, 1, 1, "mg/kg", (12, 24), None, "Off-label: 1 mg/kg/dose 1–2×/dia.", cap=40)
P["omeprazol_comp"] = dict(neo=NR("Não estabelecido."), lac=_om, cri=_om, adl=_om,
    adu=B(20, 20, 40, "mg", (12, 24), 80, "20–40 mg 1×/dia (até 40 mg 12/12 h em Zollinger-Ellison)."),
    ido=IDO(1, "Uso prolongado associa-se a fratura e infecção por C. difficile."))

P["oseltamivir"] = dict(
    pre=B(1, 1, 1.5, "mg/kg", (12,), None, "< 38 semanas de idade pós-menstrual: 1 mg/kg 12/12 h; 38–40 semanas: 1,5 mg/kg 12/12 h; por 5 dias."),
    neo=B(1, 3, 3, "mg/kg", (12,), None, "A termo: 3 mg/kg 12/12 h por 5 dias; prematuros < 38 sem IPM: 1 mg/kg; 38–40 sem: 1,5 mg/kg 12/12 h."),
    lac=B(3, 3, 3, "mg/kg", (12,), None, "< 1 ano: 3 mg/kg 12/12 h por 5 dias; profilaxia: 1×/dia."),
    cri=B(30, 45, 75, "mg", (12,), 150, "≥ 1 ano, por peso: ≤ 15 kg 30 mg; 15–23 kg 45 mg; 23–40 kg 60 mg; > 40 kg 75 mg, 12/12 h por 5 dias. Profilaxia: mesma dose 1×/dia."),
    adl=B(30, 75, 75, "mg", (12,), 150, "Por peso (< 40 kg: 60 mg; ≥ 40 kg: 75 mg) 12/12 h por 5 dias. Profilaxia: 1×/dia por 10 dias."),
    adu=B(75, 75, 75, "mg", (12,), 150, "75 mg 12/12 h por 5 dias; profilaxia 75 mg 1×/dia por 10 dias."),
    ido=IDO(1, "Ajustar pelo ClCr (< 60: 30 mg 12/12 h; < 30: 30 mg 1×/dia)."))

_pre = lambda cap, n: B(1, 1, 2, "mg/kg", (12, 24), 2, n, cap=cap, capd=60)
P["prednisona"] = dict(neo=NR("Não usar comprimido."),
    lac=_pre(60, "1–2 mg/kg/dia em 1–2 doses; asma: 3–5 dias; síndrome nefrótica: 2 mg/kg/dia (60 mg/m²)."),
    cri=_pre(60, "1–2 mg/kg/dia em 1–2 doses; asma: 3–5 dias (máx. 40 mg/dia); síndrome nefrótica: 2 mg/kg/dia (60 mg/m²)."),
    adl=_pre(60, "1–2 mg/kg/dia em 1–2 doses (máx. 60 mg/dia); asma: 40–60 mg/dia por 3–5 dias."),
    adu=B(5, 20, 60, "mg", (12, 24), 80, "5–60 mg/dia conforme indicação (≈ 1 mg/kg/dia; máx. 80 mg/dia)."),
    ido=IDO(1, "Osteoporose e hiperglicemia: menor dose eficaz pelo menor tempo."))

P["propranolol"] = dict(
    neo=B(0.25, 0.25, 1, "mg/kg", (6, 8), 5, "Arritmias/tetralogia (off-label): 0,25 mg/kg/dose a cada 6–8 h; máx. 5 mg/kg/dia."),
    lac=B(1, 2, 3, "mg/kg/dia", (8, 12), 4, "Hemangioma infantil: iniciar 0,5–1 mg/kg/dia e titular até 2–3 mg/kg/dia ÷ 2 (iniciar internado). HAS: 1–2 mg/kg/dia ÷ 2–3."),
    cri=B(1, 2, 4, "mg/kg/dia", (8, 12), 4, "Hemangioma: 1–3 mg/kg/dia ÷ 2. HAS: 1–2 mg/kg/dia ÷ 2–3; máx. 4 mg/kg/dia.", capd=640),
    adl=B(1, 2, 4, "mg/kg/dia", (8, 12), 4, "HAS: 1–2 mg/kg/dia ÷ 2–3; máx. 4 mg/kg/dia.", capd=640),
    adu=B(40, 40, 80, "mg", (12,), 320, "HAS: 40 mg 12/12 h; manutenção 80–160 mg/dia; máx. 320 mg/dia."),
    ido=IDO(0.5, "Bradicardia e hipotensão; iniciar com 20–40 mg/dia."))

P["sildenafila"] = dict(
    neo=B(0.5, 1, 2, "mg/kg", (6, 8), None, "HPPRN (off-label): 0,5–2 mg/kg a cada 6–8 h."),
    lac=B(0.5, 0.5, 1, "mg/kg", (8,), None, "Hipertensão pulmonar (off-label < 1 ano): 0,5–1 mg/kg 8/8 h.", cap=20),
    cri=B(0.5, 0.5, 1, "mg/kg", (8,), None, "Hipertensão pulmonar 1–17 anos: ≤ 20 kg 10 mg 3×/dia; > 20 kg 20 mg 3×/dia. Evitar doses altas (maior mortalidade).", cap=20),
    adl=B(10, 20, 20, "mg", (8,), 60, "≤ 20 kg: 10 mg; > 20 kg: 20 mg 3×/dia. Evitar doses altas."),
    adu=B(20, 20, 80, "mg", (8, 24), 240, "HAP: 20 mg 3×/dia (até 80 mg 3×/dia sob especialista). Disfunção erétil: 50 mg (25–100 mg) 1×/dia, máx. 100 mg/dia."),
    ido=IDO(0.5, "Iniciar com 25 mg (DE)."))

P["albendazol_susp"] = _cp(P3["albendazol_comp"])
P["amoxicilina_clavulanato_susp"] = _cp(P3["amoxicilina_comp"], "Dose calculada pelo componente amoxicilina; respeitar clavulanato ≤ 10 mg/kg/dia (doses altas exigem formulação 14:1).")
P["amoxicilina_susp"] = _cp(P3["amoxicilina_comp"])
P["azitromicina_susp"] = _cp(P3["azitromicina_comp"])
P["cefalexina_susp"] = _cp(P3["cefalexina_comp"])

_cla = B(7.5, 7.5, 7.5, "mg/kg", (12,), 15, "7,5 mg/kg/dose 12/12 h (≥ 6 meses); inibidor do CYP3A4.", cap=500, capd=1000)
P["claritromicina_susp"] = dict(neo=NR("Não estabelecido."), lac=_cla, cri=_cla, adl=_cla,
    adu=B(250, 500, 500, "mg", (12,), 1000, "250–500 mg 12/12 h."),
    ido=IDO(1, "Reduzir 50% se ClCr < 30; interações por CYP3A4 e QT."))

_dom = B(0.25, 0.25, 0.25, "mg/kg", (8,), 0.75, "0,25 mg/kg/dose até 3×/dia, por no máximo 7 dias (< 12 anos ou < 35 kg). Risco de QT longo.", cap=10, capd=30)
P["domperidona"] = dict(neo=NR("Não recomendado."),
    lac=B(0.25, 0.25, 0.25, "mg/kg", (8,), 0.75, "Dados limitados em < 1 ano: 0,25 mg/kg/dose até 3×/dia, por no máximo 7 dias. Risco de QT longo."),
    cri=_dom,
    adl=B(10, 10, 10, "mg", (8,), 30, "≥ 35 kg: 10 mg até 3×/dia, por no máximo 7 dias."),
    adu=B(10, 10, 10, "mg", (8,), 30, "10 mg até 3×/dia, por no máximo 7 dias (máx. 30 mg/dia)."),
    ido=IDO(1, "Risco de arritmia (QT); menor dose pelo menor tempo."))

P["glicerina_enema"] = dict(neo=NR("Não recomendado sem prescrição especializada."),
    lac=B(5, 5, 10, "mL/kg", None, None, "Volume individualizado (em geral 5–10 mL/kg), via retal.", cap=250),
    cri=B(5, 5, 10, "mL/kg", None, None, "Volume individualizado (em geral 5–10 mL/kg), via retal; máx. 250 mL.", cap=250),
    adl=B(5, 5, 10, "mL/kg", None, None, "Volume individualizado (em geral 5–10 mL/kg), via retal.", cap=500),
    adu=B(250, 250, 500, "mL", None, None, "250–500 mL via retal."),
    ido=IDO(1, "Atenção a desidratação e distúrbios hidroeletrolíticos."))
