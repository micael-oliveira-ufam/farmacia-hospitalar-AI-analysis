# Histórico de versões

Formato: [Versionamento Semântico](https://semver.org/lang/pt-BR/) (MAIOR.MENOR.CORREÇÃO). A versão vigente fica no arquivo `VERSION`; `python3 tools/release.py` sincroniza os demais arquivos e gera o pacote `farmacia-hospitalar-integrada-vX.Y.Z.zip`.

## 4.4.0 - 2026-10-28

- **Triagem de prescrição** (aba "Triagem" do PosologiaPED, web e app): informe faixa etária, ClCr e insuficiência hepática, adicione os medicamentos e veja alertas por gravidade: interações medicamentosas (44 regras: opioide+benzodiazepínico, ceftriaxona+cálcio em neonatos, hipercalemia, QT, valproato+meropenem, nefrotoxicidade etc.), duplicidade de princípio ativo/classe, função renal/hepática, alertas pediátricos, alta vigilância e controlados. Botão "Copiar parecer".
- Integração com o **NoHarm.ai**: o repositório `noharm-ai/backend` (MIT) é um servidor Flask + PostgreSQL multi-hospital e não roda no navegador nem no GitHub Pages. Por isso a triagem usa **lógica própria, inspirada nas categorias de alerta do NoHarm**, sem copiar código nem dados dele. Crédito em README, NOTICE e na tela.
- **GitHub Pages**: `tools/build_pages.sh` gera o site estático (`_site/`: início, /guia/, /estoque/) sem servidor, conta ou Stripe; `.github/workflows/pages.yml` publica automaticamente a cada push na `main`.
- Regras em `data/interacoes.json` (gerado por `tools/mkint.py`; conteúdo compilado por IA, exige revisão farmacêutica).

## 4.3.0 - 2026-10-23

- **PosologiaPED simplificado**: a tela inicial mostra apenas a busca e as **classes terapêuticas como botões**; ao tocar, vem a lista de medicamentos (uma linha cada) e, ao tocar no item, o detalhe com dose usual/máxima da faixa etária escolhida (botões Neonato, Lactente/criança, Adulto, Idoso) e o restante em seções recolhidas (efeitos adversos, rim/fígado, todas as faixas, cálculo por peso, fontes).
- Abas: Medicamentos e Calculadoras em destaque; Minha lista, Qualquer medicamento, Cesta, Comparar, Referências e Sobre em "Mais". Tema escuro e filtros extras removidos.
- **Botões "Importar lista do ICAM" e "Importar lista da Policlínica Codajás"** no guia (web e app) e na curva ABC (web e app). A lista da Policlínica Codajás (188 itens, com usuários ativos e custo unitário) vai em `data/codajas.json`. No guia, a associação com monografias é automática pelo nome e precisa de conferência.
- Flutter: grade de classes, tela de lista do hospital e botão de importação no FarmaGestão (apenas verificação de sintaxe, sem compilar).

## 4.2.0 — 2026-10-22
- **Novo:** contas com cadastro (e-mail e senha) e **7 dias de demonstração grátis, sem cartão**.
- **Novo:** assinatura de **R$ 29,99 por mês** via Stripe Checkout (cartão digitado na página do Stripe; o servidor não recebe dados de cartão), portal para trocar cartão e cancelar, webhook opcional e página `/conta`, `/assinar`, `/entrar`, `/termos`.
- **Novo:** módulos `/guia/` e `/estoque/` só abrem com demonstração vigente ou assinatura ativa; a página inicial (escolha do módulo) é pública; carência offline de 7 dias.
- **Novo:** app Android com login, paywall, assinatura pelo navegador e conta na tela inicial (permissão INTERNET restaurada).
- **Interface unificada (tema claro):** mesma paleta e barra superior com ícones por módulo (Início, PosologiaPED, FarmaGestão, Conta), ícones de aplicativo próprios para cada módulo; tema escuro e botão de tema removidos do guia.
- **Removido:** logo/marca da UFAM e o bloco da instituição no rodapé do FarmaGestão e no e-mail de descrição.
- **Servidor:** exige Node 22.13+ (SQLite embutido); volume `fhi-data` no Docker; 11 testes automáticos (planos, senha, sessão, checkout com Stripe simulado, webhook).
- **Aviso:** o pagamento real não foi testado contra o Stripe de verdade (sem rede e sem chaves aqui); só contra um Stripe simulado nos testes. Os textos de `/termos` são um modelo sem revisão jurídica.

## 4.1.1 — 2026-10-22
- **Corrigido:** erro de compilação do Flutter (`Mapping values are not allowed here`): o `description` do `pubspec.yaml` continha `: ` e agora está entre aspas.
- **Corrigido:** o cache offline da página inicial removia também os caches do guia e do estoque ao atualizar; agora só troca os próprios (`icam-home-2`). Isso também substitui cópias antigas que abriam direto na curva ABC.
- **Novo:** sistema de versões (`VERSION`, este histórico, `tools/release.py`, repositório git com tags) e pacote com a versão no nome da pasta.

## 4.1.0 — 2026-10-20
- **Novo:** classes **terapêuticas** (35) e **farmacológicas** (107) para os 192 monografias (`tools/classes.py`, campos `tc`/`fc` em `data/catalog.json`).
- **Novo:** interface da PosologiaPED refeita: busca grande, navegação por classe terapêutica, classe farmacológica, forma/seção ou A–Z, lista compacta com a dose da faixa etária escolhida, painel lateral de detalhe, filtros rápidos, menu "Mais", visual mais suave e modo escuro.
- **Novo:** app Android com filtros por classe terapêutica e farmacológica.
- **Aviso:** as classes foram atribuídas por IA, sem conferência item a item no ATC/OMS; requerem revisão farmacêutica.

## 4.0.0 — 2026-10-19
- **Novo:** nomes FarmaGestão (estoque e curva ABC), PosologiaPED (posologia pediátrica) e plataforma Farmácia Hospitalar Integrada.
- **Novo:** foco em hospitais pediátricos (neonatos, lactentes e crianças em destaque; alerta pediátrico antes da dose; calculadoras pediátricas primeiro).
- **Mudou:** nenhuma referência a hospital específico; a lista de 224 itens é "lista de exemplo"; nova aba **Minha lista** para o elenco de cada hospital.

## 3.0 — anterior
- Página inicial para escolher o módulo; guia e estoque offline (PWA); app Android único com seletor de módulos; Docker + Cloudflare (link temporário) com escolha automática de porta; integração paga (Gemini) removida; referência e hiperlink em cada informação.
