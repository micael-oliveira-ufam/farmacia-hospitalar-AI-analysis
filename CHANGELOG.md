# Histórico de versões

Formato: [Versionamento Semântico](https://semver.org/lang/pt-BR/) (MAIOR.MENOR.CORREÇÃO). A versão vigente fica no arquivo `VERSION`; `python3 tools/release.py` sincroniza os demais arquivos e gera o pacote `farmacia-hospitalar-integrada-vX.Y.Z.zip`.

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
