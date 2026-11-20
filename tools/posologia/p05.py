from dsl import B, NR, IDO
from p02 import P as P2
from p03 import P as P3
from p04 import P as P4
P = {}


def _cp(src, nota=None, **over):
    r = dict(src)
    r.update(over)
    if nota:
        r["nota"] = nota
    return r


_alo = B(50, 100, 150, "mg/kg/dia", (6, 8), 150, "Quelante de fósforo: 50–150 mg/kg/dia ÷ 4–6 h; ajustar pelo fósforo sérico.")
P["hidroxido_aluminio"] = dict(neo=NR("Não recomendado."), lac=NR("Evitar em lactentes (acúmulo de alumínio)."),
    cri=_alo, adl=_alo,
    adu=B(5, 10, 10, "mL", (6, 8), None, "Antiácido: 5–10 mL entre as refeições e ao deitar (suspensão 6%); evitar uso prolongado."),
    ido=IDO(1, "Constipação; acúmulo de alumínio na insuficiência renal."))

_bz = B(15, 40, 50, "mg/kg/dia", (8,), 50, "Doses em metronidazol base. Giardíase: 15 mg/kg/dia ÷ 3 por 5–7 dias. Amebíase: 35–50 mg/kg/dia ÷ 3 por 7–10 dias.", capd=2250)
P["benzoilmetronidazol"] = dict(neo=NR("Uso sob especialista (preferir EV)."), lac=_bz, cri=_bz, adl=_bz,
    adu=NR("Preferir comprimidos (ver metronidazol 250 mg)."), ido=NR("Preferir comprimidos de metronidazol; reduzir na hepatopatia grave."))

P["nistatina_susp"] = dict(
    pre=B(100000, 100000, 100000, "UI", (6,), None, "Pré-termo: 100.000 UI 4×/dia."),
    neo=B(100000, 150000, 200000, "UI", (6,), None, "A termo: 100.000–200.000 UI 4×/dia."),
    lac=B(100000, 200000, 200000, "UI", (6,), None, "Lactentes: 200.000 UI 4×/dia; manter 48 h após a cura."),
    cri=B(200000, 400000, 600000, "UI", (6,), None, "Crianças: 400.000–600.000 UI 4×/dia; manter 48 h após a cura."),
    adl=B(400000, 500000, 600000, "UI", (6,), None, "400.000–600.000 UI 4×/dia; manter 48 h após a cura."),
    adu=B(400000, 500000, 600000, "UI", (6,), None, "400.000–600.000 UI 4×/dia, bochechar e engolir."),
    ido=IDO(1, "Sem ajuste."))

P["oleo_mineral"] = dict(neo=NR("Contraindicado."), lac=NR("Evitar em < 2 anos (risco de aspiração e pneumonia lipoídica)."),
    cri=B(1, 2, 3, "mL/kg/dia", (24,), 3, "> 1 ano, sem risco de aspiração: 1–3 mL/kg/dia.", capd=90),
    adl=B(1, 2, 3, "mL/kg/dia", (24,), 3, "1–3 mL/kg/dia (máx. 90 mL/dia), sem risco de aspiração.", capd=90),
    adu=B(15, 30, 45, "mL/dia", (24,), 90, "15–45 mL/dia (máx. 90 mL/dia)."),
    ido=NR("Evitar em acamados e disfágicos (pneumonia lipoídica)."))

P["prednisolona_susp"] = _cp(P4["prednisona"], neo=NR("Uso sob especialista."))
P["sulfametoxazol_trimetoprima_susp"] = _cp(P3["sulfametoxazol_trimetoprima_inj"], "Dose calculada pelo componente trimetoprima (TMP).")

P["sais_reidratacao_oral"] = dict(neo=NR("Sob orientação médica; pequenos volumes frequentes."),
    lac=B(50, 75, 100, "mL", None, None, "Plano A (< 1 ano): 50–100 mL após cada evacuação. Plano B: 50–100 mL/kg em 4–6 h."),
    cri=B(100, 150, 200, "mL", None, None, "Plano A (1–10 anos): 100–200 mL após cada evacuação. Plano B: 50–100 mL/kg em 4–6 h."),
    adl=B(50, 75, 100, "mL/kg", None, None, "Plano B: 50–100 mL/kg em 4–6 h; Plano A: à vontade após cada evacuação."),
    adu=B(50, 75, 100, "mL/kg", None, None, "Plano B: 50–100 mL/kg em 4–6 h; Plano A: à vontade após cada evacuação."),
    ido=IDO(1, "Atenção à sobrecarga de volume em cardiopatas."))

_sem = "Suplemento nutricional: prescrição individualizada pelo nutricionista/equipe de terapia nutricional."
P["modulo_tcm"] = dict(neo=NR(_sem), lac=NR(_sem), cri=NR(_sem), adl=NR(_sem), adu=NR(_sem), ido=NR(_sem))

_asc = B(100, 200, 300, "mg/dia", (12, 24), 300, "Escorbuto: 100–300 mg/dia, em doses divididas, por ≥ 1 semana.")
P["acido_ascorbico_gts"] = dict(neo=NR("Não padronizado; apenas em deficiência comprovada, sob especialista."),
    lac=_asc, cri=_asc, adl=_asc,
    adu=B(100, 250, 250, "mg", (12, 24), 1000, "Escorbuto/deficiência: 100–250 mg 1–2×/dia (até 1 g/dia)."),
    ido=IDO(1, "Cautela na insuficiência renal (nefrolitíase por oxalato)."))

_bro = B(0.5, 0.75, 1, "mg/kg/dia", (8,), 1, "0,5–1 mg/kg/dia ÷ 3 doses; risco de reações extrapiramidais.", capd=30)
P["bromoprida_gts"] = dict(neo=NR("Não recomendado."), lac=NR("Evitar em < 1 ano (reações extrapiramidais)."),
    cri=_bro, adl=_bro,
    adu=B(10, 10, 10, "mg", (8, 12), 30, "10 mg 1–2×/dia, podendo chegar a 3×/dia (máx. 30 mg/dia)."),
    ido=IDO(0.5, "Maior risco de sintomas extrapiramidais; usar a menor dose."))

_dip = B(10, 12.5, 25, "mg/kg", (6,), 100, "10–25 mg/kg/dose a cada 6 h; máx. 100 mg/kg/dia. Não usar < 3 meses ou < 5 kg.", cap=1000, capd=4000)
P["dipirona_gts"] = dict(neo=NR("Contraindicada."), lac=_dip, cri=_dip, adl=_dip,
    adu=B(500, 1000, 1000, "mg", (6,), 4000, "500–1.000 mg até 4×/dia (máx. 4 g/dia)."),
    ido=IDO(0.75, "Hipotensão; reduzir na insuficiência renal."))

P["ibuprofeno_gts"] = _cp(P4["ibuprofeno_comp"])
P["metoclopramida_gts"] = _cp(P2["metoclopramida_inj"])

_par = B(10, 12.5, 15, "mg/kg", (4, 6), 75, "10–15 mg/kg/dose a cada 4–6 h (máx. 5 doses/dia; 75 mg/kg/dia).", cap=1000, capd=4000)
P["paracetamol"] = dict(
    pre=B(10, 10, 12, "mg/kg", (8, 12), 40, "28–32 sem IPM: 10–12 mg/kg/dose a cada 8–12 h; máx. 40 mg/kg/dia (pré-termo)."),
    neo=B(10, 12.5, 15, "mg/kg", (6, 8), 60, "≥ 32 sem IPM: 10–15 mg/kg/dose a cada 6–8 h; máx. 60 mg/kg/dia (termo)."),
    lac=_par, cri=_par, adl=_par,
    adu=B(500, 750, 1000, "mg", (4, 6), 4000, "500–1.000 mg a cada 4–6 h; máx. 4 g/dia (3 g na hepatopatia/etilismo)."),
    ido=IDO(1, "Considerar máx. 3 g/dia."))

P["simeticona"] = dict(neo=NR("Uso sob orientação médica."),
    lac=B(20, 20, 20, "mg", (6,), None, "< 2 anos: 20 mg 4×/dia.", capd=240),
    cri=B(40, 40, 40, "mg", (6,), None, "2–12 anos: 40 mg 4×/dia.", capd=480),
    adl=B(40, 80, 125, "mg", (6,), None, "40–125 mg 4×/dia.", capd=500),
    adu=B(40, 80, 125, "mg", (6,), None, "40–125 mg 4×/dia (máx. 500 mg/dia).", capd=500),
    ido=IDO(1, "Sem ajuste."))

_fe = B(1, 3, 5, "mg/kg/dia", (24,), 6, "Fe elementar. Profilaxia 6–24 meses: 1 mg/kg/dia; tratamento: 3–5 mg/kg/dia (máx. 6 mg/kg/dia; não exceder a dose do adulto).")
P["sulfato_ferroso"] = dict(
    pre=B(2, 3, 4, "mg/kg/dia", (24,), 4, "A partir de 30 dias (Fe elementar): 2 mg/kg/dia (1.500–2.500 g), 3 (1.000–1.500 g), 4 (< 1.000 g)."),
    neo=NR("Habitualmente não indicado antes de 30 dias; prematuros: ver faixa prematuro."),
    lac=_fe, cri=_fe, adl=_fe,
    adu=B(40, 120, 200, "mg", (12, 24), 200, "Fe elementar: tratamento 60–200 mg/dia; gestação (profilaxia) 40 mg/dia."),
    ido=IDO(0.5, "Constipação; considerar dias alternados."))

_cb = "Conforme rótulo/bula do fabricante; sem posologia padronizada."
P["vitaminas_complexo_b_gts"] = dict(neo=NR(_cb), lac=NR(_cb), cri=NR(_cb), adl=NR(_cb), adu=NR(_cb), ido=NR(_cb))

P["ambroxol_adulto"] = dict(neo=NR("Não recomendado."), lac=NR("Usar xarope pediátrico."), cri=NR("Usar xarope pediátrico (15 mg/5 mL)."),
    adl=B(30, 30, 30, "mg", (8, 12), None, "≥ 12 anos: 30 mg 3×/dia nos 2–3 primeiros dias, depois 2×/dia.", capd=120),
    adu=B(30, 30, 30, "mg", (8, 12), None, "30 mg (5 mL) 3×/dia nos 2–3 primeiros dias, depois 2×/dia (máx. 120 mg/dia).", capd=120),
    ido=IDO(1, "Sem ajuste."))

_amb = B(1.2, 1.5, 1.6, "mg/kg/dia", (8, 12), 1.6, "1,2–1,6 mg/kg/dia ÷ 2–3 doses (< 2 anos: sob orientação médica).", capd=45)
P["ambroxol_pediatrico"] = dict(neo=NR("Não recomendado."), lac=_amb, cri=_amb,
    adl=NR("≥ 12 anos: usar xarope adulto."), adu=NR("Usar xarope adulto."), ido=NR("Usar xarope adulto."))

P["dexclorfeniramina"] = dict(neo=NR("Contraindicada."), lac=NR("Contraindicada em < 2 anos."),
    cri=B(0.5, 1, 1, "mg", (4, 6, 8), None, "2–6 anos: 0,5 mg a cada 4–6 h (máx. 3 mg/dia); 6–12 anos: 1 mg a cada 4–6 h (máx. 6 mg/dia).", capd=6),
    adl=B(2, 2, 2, "mg", (4, 6, 8), None, "2 mg a cada 4–6 h (máx. 12 mg/dia).", capd=12),
    adu=B(2, 2, 2, "mg", (4, 6, 8), None, "2 mg (5 mL) a cada 4–6 h (máx. 12 mg/dia).", capd=12),
    ido=IDO(0.5, "Evitar (Beers): sedação e efeitos anticolinérgicos."))

_hx = B(1, 1.5, 2, "mg/kg/dia", (6, 8), 2, "1–2 mg/kg/dia ÷ 3–4 doses (máx. 2 mg/kg/dia em ≤ 40 kg).", capd=100)
P["hidroxizine"] = dict(neo=NR("Não recomendado."), lac=NR("Dados limitados em < 2 anos; evitar."),
    cri=_hx, adl=_hx,
    adu=B(25, 25, 25, "mg", (6, 8), 100, "25 mg 3–4×/dia (máx. 100 mg/dia)."),
    ido=IDO(0.5, "Evitar (Beers); se necessário, máx. 50 mg/dia."))

_lac = B(1.5, 2, 3, "mL/kg/dia", (12, 24), 3, "1–2 g/kg/dia (1,5–3 mL/kg/dia) ÷ 1–2 doses; lactentes: 2,5 mL 2×/dia.", capd=60)
P["lactulose"] = dict(neo=NR("Não usar."), lac=_lac, cri=_lac, adl=_lac,
    adu=B(15, 15, 45, "mL", (6, 8, 12, 24), None, "Constipação: 15–30 mL/dia; encefalopatia hepática: 30–45 mL 3–4×/dia (titular para 2–3 evacuações pastosas/dia)."),
    ido=IDO(1, "Desidratação e hipernatremia."))
