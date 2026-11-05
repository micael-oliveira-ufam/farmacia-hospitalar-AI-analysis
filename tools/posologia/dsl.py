"""Formato compacto para escrever a posologia por faixa etária.

Faixas (chaves): pre, neo, lac, cri, adl, adu, ido.
  pre  prematuro (< 37 semanas de idade gestacional)
  neo  neonato (0-28 dias)
  lac  lactente (29 dias a 23 meses)
  cri  crianca (2 a 11 anos)
  adl  adolescente (12 a 17 anos)
  adu  adulto (18 a 64 anos)
  ido  idoso (>= 65 anos)

B(min, rec, max, unidade, intervalos_h, dmax_dia, nota, cap=None, capd=None)
  unidade: "mg/kg", "mg", "mcg/kg", "mcg", "UI/kg", "UI", "mL/kg", "mL", "mg/m2", "mEq/kg", "mEq", "g", "g/kg",
           ou taxa continua: "mcg/kg/min", "mg/kg/h", "mL/h" ... (intervalos = None)
  intervalos_h: tupla de horas permitidas (ex.: (8,12)) ou None (dose unica, SOS ou infusao continua)
  dmax_dia: teto diario na mesma unidade da faixa (mg/kg -> mg/kg/dia; mg -> mg/dia) ou None
Valores especiais por faixa:
  None            nao recomendado / sem dose estabelecida (a nota explica)
  NR("motivo")    nao recomendado, com motivo
  "="             (lac/cri/adl) usa a faixa mg/kg ja cadastrada em data/dose.json
  DESC("texto")   posologia descritiva (frequencia/volume/aplicacao), sem min/rec/max numericos
  IDO(f, nota)    idoso = adulto x f (f=1: igual ao adulto)
"""
def B(a, r, b, u="mg", i=None, d=None, n="", cap=None, capd=None):
    """cap = dose maxima absoluta por administracao (em mg/UI/...; so para faixas por kg ou m2);
    capd = teto absoluto por dia (mesma unidade)."""
    return {"a": a, "r": r, "b": b, "u": u, "i": list(i) if i else None, "d": d, "n": n, "cap": cap, "capd": capd}

def NR(motivo):
    return {"nr": motivo}

def DESC(texto):
    """Posologia descritiva (sem dose numerica): topicos, inalatorios, oftalmicos, SRO etc."""
    return {"desc": texto}

def IDO(f, n=""):
    return {"ido_f": f, "n": n}

def F(moa, acao, fk=None, ae=None, pa=None, r=None, **kw):
    """Ficha farmacologica para medicamentos sem monografia no catalogo (e para os adicionais)."""
    d = {"moa": moa, "acao": acao}
    if fk: d["fk"] = fk
    if ae: d["ae"] = ae
    if pa: d["pa"] = pa
    if r: d["r"] = r
    d.update(kw)
    return d
