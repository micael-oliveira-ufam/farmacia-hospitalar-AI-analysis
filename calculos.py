"""Motor de cálculos para avaliação de prescrições pediátricas.

Contém funções puras (sem dependência do Flask) para:
- cálculo de dose por peso;
- avaliação da dose prescrita frente à faixa terapêutica de referência;
- cálculo de volume/quantidade a administrar;
- cálculo do número de frascos/ampolas necessários;
- cálculo de dose unitária (fracionamento de uma apresentação);
- verificação de interações medicamentosas entre os itens de uma prescrição.
"""
from __future__ import annotations

import json
import math
from dataclasses import dataclass, field
from itertools import combinations
from pathlib import Path
from typing import Optional

DATA_DIR = Path(__file__).parent / "data"


def carregar_medicamentos() -> dict:
    with open(DATA_DIR / "medicamentos.json", encoding="utf-8") as f:
        lista = json.load(f)
    return {m["id"]: m for m in lista}


_SEV_LABEL = {0: "leve", 1: "moderada", 2: "grave", 3: "grave"}

# Mapa de aliases: IDs genéricos do interacoes.json → IDs reais do medicamentos.json.
# Um ID genérico pode mapear para múltiplos IDs (ex.: ibuprofeno → comp e gotas).
_ALIAS_IDS: dict[str, list[str]] = {
    "ibuprofeno": ["ibuprofeno_comp", "ibuprofeno_gts"],
    "prednisolona": ["prednisolona_susp"],
    "prednisona": ["prednisona"],
    "dexametasona": ["dexametasona_inj", "dexametasona_elixir", "dexametasona_creme"],
    "metilprednisolona": ["metilprednisolona"],
    "hidrocortisona": ["hidrocortisona"],
    "diazepam": ["diazepam_comp", "diazepam_inj"],
    "midazolam injetavel": ["midazolam"],
    "insulina": ["insulina_regular", "insulina_nph"],
    "ciprofloxacino": ["ciprofloxacino_comp", "ciprofloxacino_inj"],
    "claritromicina": ["claritromicina_susp", "claritromicina_inj"],
    "azitromicina": ["azitromicina_comp", "azitromicina_susp"],
    "metoclopramida": ["metoclopramida_gts", "metoclopramida_inj"],
    "bromoprida": ["bromoprida_gts", "bromoprida_inj"],
    "fenobarbital": ["fenobarbital_comp", "fenobarbital_inj", "fenobarbital_susp"],
    "carbamazepina": ["carbamazepina_comp", "carbamazepina_susp"],
    "valproato": ["valproato_xarope"],
    "valproato de sodio": ["valproato_xarope"],
    "clonazepam": ["clonazepam_comp", "clonazepam_gts"],
    "haloperidol": ["haloperidol_comp", "haloperidol_gts", "haloperidol_inj"],
    "losartana potassica": ["losartana"],
    "enoxaparina sodica": ["enoxaparina"],
    "heparina": ["heparina_sodica"],
    "fluconazol": ["fluconazol_comp", "fluconazol_inj"],
    "omeprazol": ["omeprazol_comp", "omeprazol_inj"],
    "metronidazol": ["metronidazol_comp", "metronidazol_inj"],
    "sulfametoxazol": ["sulfametoxazol_trimetoprima_susp", "sulfametoxazol_trimetoprima_inj"],
    "piperacilina": ["piperacilina_tazobactam"],
    "salbutamol": ["salbutamol_nebulizacao", "salbutamol_spray", "salbutamol_xarope", "salbutamol_inj"],
    "brometo de ipratropio": ["brometo_ipratropio"],
    "tobramicina": ["tobramicina_oftalmica"],
    "polimixina b": ["polimixina_b"],
    "anfotericina b": ["anfotericina_b"],
    "anfotericina b lipossomal": ["anfotericina_lipossomal"],
    "hidroxizina": ["hidroxizine"],
    "hidroxido de aluminio": ["hidroxido_aluminio"],
    "cloreto de potassio": ["cloreto_potassio_10", "cloreto_potassio_xarope"],
    "cloreto de calcio": ["cloreto_sodio_10"],  # não existe no sistema; pular
    "gluconato de calcio": ["gliconato_calcio"],
    "carbonato de calcio": ["carbonato_calcio"],
    "sulfato de magnesio": ["sulfato_magnesio"],
    "sulfato ferroso": ["sulfato_ferroso"],
    "acido acetilsalicilico": ["aas"],
    "remifentanil": ["remifentanila"],
    "tenoxicam po injetavel": ["tenoxicam"],
    "contraste": ["contraste_nao_ionico", "contraste_meglumina"],
}


def _expandir_id(med_id: str) -> list[str]:
    """Expande um ID genérico para os IDs reais do sistema, se houver alias."""
    return _ALIAS_IDS.get(med_id, [med_id])


def carregar_interacoes() -> list:
    """Carrega e normaliza interacoes.json.

    Suporta dois formatos:
    - Lista plana (legado): [{medicamentos, gravidade, descricao}, ...]
    - Objeto com regras (novo): {grupos, regras: [{a, b, sev, titulo, mec, cond}, ...]}

    IDs genéricos são expandidos via _ALIAS_IDS para os IDs reais do medicamentos.json.
    Pares onde algum ID não existe no medicamentos.json são filtrados ao carregar.
    """
    with open(DATA_DIR / "interacoes.json", encoding="utf-8") as f:
        raw = json.load(f)

    if isinstance(raw, list):
        return raw  # formato legado — retorna direto

    # Carrega medicamentos válidos para filtrar pares inexistentes
    medicamentos_validos: set[str] = set(carregar_medicamentos().keys())

    # Formato novo: expande grupos e converte para lista plana
    grupos_raw: dict[str, list[str]] = raw.get("grupos", {})
    # Expande aliases dentro dos grupos também
    grupos: dict[str, list[str]] = {}
    for nome, membros in grupos_raw.items():
        expandidos: list[str] = []
        for m in membros:
            expandidos.extend(_expandir_id(m))
        grupos[nome] = expandidos

    regras = raw.get("regras", [])
    resultado: list[dict] = []
    vistos: set[frozenset] = set()  # evita duplicatas por causa dos aliases

    def _adicionar(med_a: str, med_b: str, gravidade: str, descricao: str) -> None:
        if med_a not in medicamentos_validos or med_b not in medicamentos_validos:
            return
        par = frozenset([med_a, med_b])
        if par in vistos:
            return
        vistos.add(par)
        resultado.append({"medicamentos": [med_a, med_b], "gravidade": gravidade, "descricao": descricao})

    for regra in regras:
        a_raw = regra.get("a")
        b_raw = regra.get("b")

        if not a_raw:
            continue  # regra incompleta

        if a_raw.startswith("@"):
            membros_a = grupos.get(a_raw.lstrip("@"), [])
        else:
            membros_a = _expandir_id(a_raw)

        gravidade = _SEV_LABEL.get(int(regra.get("sev", 1)), "moderada")
        descricao = regra.get("titulo", "")
        mec = regra.get("mec", "")
        cond = regra.get("cond", "")
        if mec:
            descricao += f" — {mec}"
        if cond:
            descricao += f" Conduta: {cond}"

        if b_raw is None:
            # regra intragrupo: todos os pares dentro de membros_a interagem
            for i, med_a in enumerate(membros_a):
                for med_b in membros_a[i + 1:]:
                    _adicionar(med_a, med_b, gravidade, descricao)
            continue

        if b_raw.startswith("@"):
            membros_b = grupos.get(b_raw.lstrip("@"), [])
        else:
            membros_b = _expandir_id(b_raw)

        for med_a in membros_a:
            for med_b in membros_b:
                _adicionar(med_a, med_b, gravidade, descricao)

    return resultado


# ---------------------------------------------------------------------------
# Cálculo de dose
# ---------------------------------------------------------------------------

@dataclass
class ResultadoDose:
    dose_por_administracao_mg: float
    dose_diaria_total_mg: float
    dose_mg_kg_dose: float
    dose_mg_kg_dia: float


def calcular_dose(peso_kg: float, dose_mg_kg: float, doses_por_dia: float) -> ResultadoDose:
    """Calcula a dose (em mg) por administração e a dose diária total.

    peso_kg: peso do paciente em kg
    dose_mg_kg: dose prescrita, em mg/kg, por administração
    doses_por_dia: número de administrações por dia (ex.: intervalo de 8h -> 3x/dia)
    """
    if peso_kg <= 0:
        raise ValueError("Peso deve ser maior que zero.")
    if dose_mg_kg < 0:
        raise ValueError("Dose mg/kg não pode ser negativa.")
    if doses_por_dia <= 0:
        raise ValueError("Número de doses por dia deve ser maior que zero.")

    dose_por_administracao = peso_kg * dose_mg_kg
    dose_diaria_total = dose_por_administracao * doses_por_dia
    dose_mg_kg_dia = dose_mg_kg * doses_por_dia

    return ResultadoDose(
        dose_por_administracao_mg=round(dose_por_administracao, 3),
        dose_diaria_total_mg=round(dose_diaria_total, 3),
        dose_mg_kg_dose=round(dose_mg_kg, 3),
        dose_mg_kg_dia=round(dose_mg_kg_dia, 3),
    )


# ---------------------------------------------------------------------------
# Avaliação da dose frente à faixa de referência
# ---------------------------------------------------------------------------

@dataclass
class AvaliacaoDose:
    status: str  # "abaixo" | "adequada" | "acima" | "sem_referencia"
    mensagem: str
    dose_mg_kg_dose: Optional[float] = None
    dose_mg_kg_dia: Optional[float] = None
    faixa_min_mg_kg_dose: Optional[float] = None
    faixa_max_mg_kg_dose: Optional[float] = None
    excede_dose_maxima_absoluta: bool = False
    excede_dose_maxima_dia: bool = False


def avaliar_dose_prescrita(
    medicamento: dict,
    peso_kg: float,
    dose_prescrita_mg: float,
    doses_por_dia: float,
) -> AvaliacaoDose:
    """Compara a dose prescrita (em mg, por administração) com a faixa de
    referência (mg/kg/dose) do medicamento, e verifica limites diários e
    dose máxima absoluta.
    """
    dose_mg_kg_dose = dose_prescrita_mg / peso_kg
    dose_mg_kg_dia = dose_mg_kg_dose * doses_por_dia
    dose_diaria_total_mg = dose_prescrita_mg * doses_por_dia

    faixa_min = medicamento.get("dose_min_mg_kg_dose")
    faixa_max = medicamento.get("dose_max_mg_kg_dose")
    dose_max_dia_mg_kg = medicamento.get("dose_max_dia_mg_kg")
    dose_max_absoluta = medicamento.get("dose_max_absoluta_mg_dia")

    excede_absoluta = bool(dose_max_absoluta) and dose_diaria_total_mg > dose_max_absoluta
    excede_dia_mg_kg = bool(dose_max_dia_mg_kg) and dose_mg_kg_dia > dose_max_dia_mg_kg

    if faixa_min is None or faixa_max is None:
        status = "sem_referencia"
        mensagem = "Não há faixa de referência cadastrada para este medicamento; avalie clinicamente."
    elif dose_mg_kg_dose < faixa_min:
        status = "abaixo"
        percentual = (dose_mg_kg_dose / faixa_min) * 100 if faixa_min else 0
        mensagem = (
            f"Dose abaixo da faixa recomendada ({faixa_min}-{faixa_max} mg/kg/dose). "
            f"Corresponde a {percentual:.0f}% do mínimo recomendado."
        )
    elif dose_mg_kg_dose > faixa_max:
        status = "acima"
        percentual = (dose_mg_kg_dose / faixa_max) * 100 if faixa_max else 0
        mensagem = (
            f"Dose ACIMA da faixa recomendada ({faixa_min}-{faixa_max} mg/kg/dose). "
            f"Corresponde a {percentual:.0f}% do máximo recomendado."
        )
    else:
        status = "adequada"
        mensagem = f"Dose dentro da faixa recomendada ({faixa_min}-{faixa_max} mg/kg/dose)."

    if excede_dia_mg_kg:
        mensagem += (
            f" ATENÇÃO: dose diária total ({dose_mg_kg_dia:.2f} mg/kg/dia) excede o máximo "
            f"diário recomendado ({dose_max_dia_mg_kg} mg/kg/dia)."
        )
    if excede_absoluta:
        mensagem += (
            f" ATENÇÃO: dose diária total ({dose_diaria_total_mg:.1f} mg/dia) excede a dose "
            f"máxima absoluta recomendada ({dose_max_absoluta} mg/dia)."
        )

    return AvaliacaoDose(
        status=status,
        mensagem=mensagem,
        dose_mg_kg_dose=round(dose_mg_kg_dose, 3),
        dose_mg_kg_dia=round(dose_mg_kg_dia, 3),
        faixa_min_mg_kg_dose=faixa_min,
        faixa_max_mg_kg_dose=faixa_max,
        excede_dose_maxima_absoluta=excede_absoluta,
        excede_dose_maxima_dia=excede_dia_mg_kg,
    )


# ---------------------------------------------------------------------------
# Cálculo de volume / quantidade a administrar (dose unitária)
# ---------------------------------------------------------------------------

@dataclass
class ResultadoDoseUnitaria:
    quantidade: float
    unidade: str
    mensagem: str


def calcular_dose_unitaria(dose_mg: float, concentracao: float, unidade_concentracao: str) -> ResultadoDoseUnitaria:
    """Calcula a quantidade (volume, comprimidos, etc.) correspondente à dose
    prescrita, a partir da concentração da apresentação.

    unidade_concentracao segue o padrão "mg/mL", "mg/comprimido", "mg/frasco", "UI/mL".
    """
    if concentracao <= 0:
        raise ValueError("Concentração deve ser maior que zero.")

    quantidade = dose_mg / concentracao
    unidade_destino = unidade_concentracao.split("/")[-1] if "/" in unidade_concentracao else "unidade(s)"

    return ResultadoDoseUnitaria(
        quantidade=round(quantidade, 3),
        unidade=unidade_destino,
        mensagem=f"Administrar {round(quantidade, 3)} {unidade_destino} para atingir {dose_mg} mg.",
    )


# ---------------------------------------------------------------------------
# Cálculo de número de frascos/ampolas
# ---------------------------------------------------------------------------

@dataclass
class ResultadoFrascos:
    numero_frascos: int
    quantidade_total_disponivel: float
    sobra: float
    unidade: str


def calcular_numero_frascos(dose_total: float, quantidade_por_frasco: float, unidade: str = "mg") -> ResultadoFrascos:
    """Calcula quantos frascos/ampolas inteiros são necessários para atender
    a uma dose (ou volume) total necessária, e a sobra resultante.

    dose_total: quantidade total necessária (mg, ou mL, conforme unidade)
    quantidade_por_frasco: quantidade contida em cada frasco/ampola, na mesma unidade
    """
    if quantidade_por_frasco <= 0:
        raise ValueError("Quantidade por frasco deve ser maior que zero.")
    if dose_total < 0:
        raise ValueError("Dose total não pode ser negativa.")

    numero_frascos = math.ceil(round(dose_total / quantidade_por_frasco, 6))
    numero_frascos = max(numero_frascos, 1) if dose_total > 0 else 0
    quantidade_disponivel = numero_frascos * quantidade_por_frasco
    sobra = round(quantidade_disponivel - dose_total, 3)

    return ResultadoFrascos(
        numero_frascos=numero_frascos,
        quantidade_total_disponivel=round(quantidade_disponivel, 3),
        sobra=sobra,
        unidade=unidade,
    )


# ---------------------------------------------------------------------------
# Verificação de interações medicamentosas
# ---------------------------------------------------------------------------

@dataclass
class InteracaoEncontrada:
    medicamento_a: str
    medicamento_b: str
    gravidade: str
    descricao: str


ORDEM_GRAVIDADE = {"grave": 3, "moderada": 2, "leve": 1}


def verificar_interacoes(ids_medicamentos: list, medicamentos_db: dict, interacoes_db: list) -> list:
    """Verifica todos os pares possíveis entre os medicamentos prescritos
    contra a base de interações conhecidas.
    """
    encontradas: list[InteracaoEncontrada] = []
    ids_unicos = list(dict.fromkeys(ids_medicamentos))

    mapa_interacoes = {}
    for interacao in interacoes_db:
        par = frozenset(interacao["medicamentos"])
        mapa_interacoes[par] = interacao

    for id_a, id_b in combinations(ids_unicos, 2):
        par = frozenset([id_a, id_b])
        interacao = mapa_interacoes.get(par)
        if interacao:
            nome_a = medicamentos_db.get(id_a, {}).get("nome", id_a)
            nome_b = medicamentos_db.get(id_b, {}).get("nome", id_b)
            encontradas.append(
                InteracaoEncontrada(
                    medicamento_a=nome_a,
                    medicamento_b=nome_b,
                    gravidade=interacao["gravidade"],
                    descricao=interacao["descricao"],
                )
            )

    encontradas.sort(key=lambda i: ORDEM_GRAVIDADE.get(i.gravidade, 0), reverse=True)
    return encontradas
