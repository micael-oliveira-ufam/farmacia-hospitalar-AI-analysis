# Metodologia

Todas as fórmulas têm teste automático (`guia/test.js`, `abc-app/tests/abc.test.ts`, `flutter_app/test/calc_test.dart`). Chaves entre colchetes remetem a [REFERENCIAS.md](REFERENCIAS.md).

## Curva ABC (app de estoque)
- Ordenação decrescente por valor anual (consumo × custo) ou por consumo. Classe A até 80% do acumulado, B até 95%, C o restante. Cortes 80/95 são a convenção usual; o estudo [ABCP] (Devnani 2010, [DOI](https://doi.org/10.4103/0975-1483.63170)) aplica a análise ABC (e VED) em farmácia hospitalar.
- CMD = consumo mensal ÷ 30.
- Estoque de emergência (EE) = (CMD máximo − CMD) × lead time. Sem consumo máximo informado, **estima-se 1,5 × a média (premissa do aplicativo original, não de literatura)**.
- Conceitos de ciclo logístico/estoque de segurança: [MSAF] e [MSH]. Os links desses dois itens são de pesquisa/site oficial, não conferidos como documento direto.

## PADRÃO, PEDIDO, ponto de pedido e cobertura (proposta deste projeto)
- Ponto de pedido = CMD × lead time + EE.
- **PADRÃO** (nível de reposição) = CMD × (lead time + ciclo de revisão) + EE. Ciclo de revisão padrão: 7 dias (pedido semanal), editável.
- **PEDIDO** = máx(0, PADRÃO − estoque atual). Sem estoque informado, não é calculado.
- Cobertura (dias) = estoque ÷ CMD.
- Esses quatro cálculos são uma **proposta de método** montada a partir dos conceitos acima, e não uma fórmula copiada de uma publicação. Ajuste ao protocolo do hospital antes de usar em compras.

## Calculadoras clínicas (guia e app Android)
| Cálculo | Fórmula | Fonte |
|---|---|---|
| Superfície corporal | √(altura[cm] × peso[kg] ÷ 3600) | [MOST] |
| Depuração de creatinina | (140 − idade) × peso ÷ (72 × SCr) × 0,85 se mulher | [CG] |
| TFG pediátrica | 0,413 × altura[cm] ÷ SCr | [SCHW] |
| TFG adulto | CKD-EPI 2021 sem raça (coeficientes na tela) | [CKDEPI] |
| Manutenção hídrica | 100/50/20 mL/kg/dia; regra 4-2-1 mL/kg/h | [HS], [NICE] |
| Infusão | mL/h = mcg/kg/min × kg × 60 ÷ (mg/mL × 1000) | conversão de unidades |
| Gotejamento | gotas/min = mL × fator ÷ (h × 60); macro 20, micro 60 | conversão de unidades |
| Diluição | V₁ = C₂ × V₂ ÷ C₁ | [ANSEL] (princípio geral) |

## Classificações de segurança
- **Alta vigilância:** lista ISMP Brasil 2019 ([ISMP], PDF aberto e conferido).
- **Nefro/Hepato "tóxico" e "atenção":** escala **interna e não oficial** (0 = sem alerta, 1 = atenção, 2 = tóxico), apoiada em [NEFRO] e [LTOX]. Serve para triagem; não substitui avaliação clínica.
- **Controlado:** seções de controle especial; [P344].
- **Checagem da cesta:** soma as classificações acima e agrupa por classe. **Não avalia interações nem doses.**

## Origem do conteúdo de doses
Lista de exemplo transcrita de PDF escaneado de uma lista institucional (224 itens), usada apenas como exemplo. Posologias, efeitos adversos e alertas foram compilados por IA a partir do conhecimento das fontes citadas, sem consulta item a item aos compêndios pagos. **Requer revisão por farmacêutico responsável antes do uso assistencial.**

## Foco pediátrico (PosologiaPED)
- Faixa padrão: lactentes e crianças (29 dias a 17 anos); neonatos (0 a 28 dias) em seleção própria. Adultos e idosos aparecem só como referência.
- O alerta pediátrico é exibido antes das doses. As calculadoras pediátricas (dose por peso, manutenção hídrica Holliday-Segar, superfície corporal Mosteller, TFG Schwartz) vêm primeiro; Cockcroft-Gault e CKD-EPI são marcadas como de adultos.
- Neonatos e prematuros exigem atenção à idade gestacional e pós-natal, não contempladas pelas calculadoras. **Doses pediátricas devem ser conferidas por farmacêutico na fonte citada.**
- A correspondência da aba *Minha lista* é feita pelo nome do fármaco (sem sal/forma) e é apenas uma sugestão a confirmar.
