# Histórico de versões

Formato: [Versionamento Semântico](https://semver.org/lang/pt-BR/) (MAIOR.MENOR.CORREÇÃO). A versão vigente fica no arquivo `VERSION`; `python3 tools/release.py` sincroniza os demais arquivos e gera o pacote `farmacia-hospitalar-integrada-vX.Y.Z.zip`.

## 4.24.4
- **Análise Detalhada:** agrupamento pela forma farmacêutica básica (Injetáveis, Comprimidos e cápsulas, Suspensões e soluções, Gotas e emulsão, Xaropes e elixir, Pomadas, cremes, géis e loções, Inalatórios, Oftálmicos), e não mais pela seção do catálogo. A forma é gravada no catálogo pelo gerador `tools/mkcat.py`.

## 4.24.3
- **Análise Detalhada:** a tabela é agrupada pela forma farmacêutica (Injetáveis, Comprimidos e cápsulas, etc.), com contagem e valor total por grupo. Itens sem forma informada ficam em um grupo próprio.

## 4.24.2
- **Estoque:** removido o botão *Editar quantidades*; as quantidades são editadas só na janela *Gerenciar quantidade em estoque*.

## 4.24.1
- **Página inicial:** nova seção **Quem orienta**, com a Profa. Dra. Clarice Veloso, o Prof. Dr. Evandro Silva e a Dra. Juliana Carvalho (preceptora). O Prof. Dr. Evandro saiu da seção Quem faz. Novo item *Orientação* no menu.

## 4.24.0
- **Estoque:** dois inventários separados, **Medicamentos na Farmácia Clínica** e **Medicamentos no CAF**, cada um com seus itens, quantidades, análise ABC, pedido semanal e backup. Os itens que já existiam ficam no CAF; a Farmácia Clínica começa vazia.
- **Estoque:** removidas a janela *Inserção Manual de Medicamento* e a lista *Itens Cadastrados*. Adicionar e excluir medicamentos (com confirmação) agora é feito em **Gerenciar quantidade em estoque**.
- **Análise Detalhada:** o nome do medicamento deixou de ser cortado; os selos ficam numa linha própria.
- **Créditos:** o Prof. Dr. Evandro Silva passou para **Orientação**, junto da Profa. Dra. Clarice Veloso, e saiu da lista de autores.

## 4.23.2
- **Ficha:** removido o bloco *Calcular dose por peso*, que repetia o cálculo de *Dose e posologia para este paciente*.

## 4.23.1
- **Posologia:** a origem das doses aparece sempre de forma explícita. O seletor *Fonte das doses* troca a tabela entre **bulas (ANVISA/FDA) e referências citadas**, **Hospital Israelita Albert Einstein (Manual Farmacêutico)**, **Lexicomp Pediatric & Neonatal Dosage Handbook** (triagem automática, sem reproduzir os valores do livro) e **Sírio-Libanês (PCR)**, com a fonte escrita acima da tabela. O rótulo *Base própria* foi removido.

## 4.23.0
- **Fonte das doses:** na ficha de cada medicamento, o seletor *Outras fontes de dose* permite escolher entre a base própria, o **Manual Farmacêutico do Einstein** (faixas pediátricas por kg de 74 medicamentos) e o **cartão de PCR do Sírio-Libanês** (21 medicamentos de emergência). Cada fonte aparece com link da ficha e comparação com a nossa faixa. Guardamos só números e links, sem copiar o texto dos manuais. O Guia Farmacêutico online do Sírio estava fora do ar na coleta.

## 4.22.0
- **Estoque:** novo botão **Gerenciar quantidade em estoque** abre uma janela na própria página, com busca, campos de quantidade e **Salvar quantidades**; ao salvar aparece a mensagem de confirmação com o número de itens atualizados.
- **Relatórios:** removido o botão *Ver a lista com as referências* da tela; as referências seguem na coluna **Referências** do PDF.

## 4.21.0
- **Relatórios:** novos PDFs de *Medicamentos do ICAM* (lista original transcrita, por forma e tipo, com classe, via e alertas) e de *PPS no CAF* (com fotos quando há internet). Os relatórios de hepatotóxicos e nefrotóxicos ganharam a coluna **Referências (de onde foi extraído)**: obra, seção, escore, link e trecho do nível, mais as diretrizes do manejo. A tabela com as mesmas referências aparece na tela.
- **Autores em todos os relatórios:** Micael Davi Lima de Oliveira (ICAM) e Ennylay (ICAM) saem no rodapé de todo PDF e no pedido impresso.
- **Estoque (ICAM):** nova lista *Medicamentos do ICAM* (com estoque e consumo mensal quando informados), ao lado dos PPS, com botões para **ocultar ou mostrar** cada uma.
- **Estoque, edição de quantidades:** "Editar quantidades" abre campos direto na tabela; os alterados ficam em amarelo e uma barra fixa traz **Salvar** e **Descartar**.
- Seção "Como o medicamento age" removida das fichas; logos da UFAM publicados (estavam fora do repositório).

## 4.20.0
- **Farmacologia detalhada** em cada ficha do Controle terapêutico: classe, mecanismo, farmacodinâmica, absorção, distribuição, metabolismo, excreção, meia-vida e pontos para a conduta clínica, com citação de capítulo e página. 221 verbetes em `data/farmacologia.json`.
- Fonte principal: Goodman & Gilman, *As Bases Farmacológicas da Terapêutica*, 14ª ed. (Brunton et al., 2022), resumido com palavras próprias. 167 verbetes vêm em grande parte do livro, 35 em parte e 19 são conhecimento geral (sinalizados na ficha).
- **Conteúdo compilado por IA; exige revisão farmacêutica.** Cefalotina, dipirona, ambroxol, TCM e contraste iodado não iônico ainda não têm verbete (8 itens do catálogo).

## 4.19.1
- **UFAM e equipe no cabeçalho e no rodapé** de todos os módulos (web e Android): autores Micael Davi Lima de Oliveira e Elias de Souza Barros, orientadora Profa. Dra. Clarice Veloso e Prof. Dr. Evandro Silva e preceptora Dra. Juliana Carvalho.
- **PPS no CAF no Android:** botão "PPS no CAF" no Estoque da unidade ICAM abre a lista com foto, CMM, função e relatório em PDF (`flutter_app/assets/pps.html`, gerado por `tools/mkpps_app.py`). Não compilado neste ambiente (sem SDK Flutter): conferir ao gerar o APK.
- Repositório renomeado para `pharmacentral-farmacia-hospitalar` (links atualizados).

## 4.19.0
- **PPS no CAF (Estoque, unidade ICAM):** nova seção com os 443 produtos para saúde da lista do ICAM, cada um com foto ilustrativa, descrição, CMM e função, busca e filtro por categoria. 406 itens têm foto; 37 aparecem como "sem foto". Fotos ilustrativas por tipo de produto, com origem e licença (Wikimedia Commons/Openverse e lojas de materiais hospitalares). CMM do código 4046 a confirmar.
- **Relatório em PDF dos PPS** (com fotos, respeitando busca e categoria). `design/pcpdf.js` passou a embutir imagens JPEG.

## 4.18.0
- **Tema claro por padrão** no site e no aplicativo; o escuro continua disponível no botão de tema.
- **Logo da UFAM no rodapé** de todos os módulos.
- **Novos módulos: Pedidos e Prontuário.** Pedidos: solicitação do CAF à CEMA e transferência do CAF para a Farmácia Clínica. Prontuário: acompanhamento farmacêutico por número de prontuário (sem nome), prescrição com alerta de fígado e rim, evoluções e intervenções. Dados só no aparelho; web e Android.
- **Manejo de medicamentos nefro e hepatotóxicos** (`data/manejo.json`, gerado por `tools/mkmanejo.py`): para cada um dos 89 fármacos sinalizados, intervenção, monitorização, opções mais seguras e quando suspender, por grupo, com fontes (KDIGO, ACG, LiverTox, IDSA, ATS e outras). Aparece na ficha do guia. Compilado por IA, exige revisão farmacêutica.
- **Relatórios em PDF** gerados offline (`design/pcpdf.js`): nefrotóxicos e hepatotóxicos (guia, aba Relatórios), curva ABC e controle de estoque (Estoque web), lista de pacientes e notificações (Prontuário). No Android o PDF abre a folha de compartilhamento. O módulo de estoque nativo do Android ainda não gera PDF.
- **Notificação de reação adversa** no Prontuário: formulário, gravidade, conduta, causalidade de Naranjo, situação e nº do VigiMed, ficha em PDF para transcrição no VigiMed.
- **Teicoplanina**: nível renal 2 (SmPC) e fígado sem escore, com a nota e a citação.

## 4.17.0
- **Estoque e Curva ABC com duas unidades padrão**: ICAM e Policlínica Codajás. A lista de itens de cada uma é carregada automaticamente na primeira abertura, e os botões "Importar lista do ICAM" e "Importar lista da Policlínica Codajás" foram removidos. O usuário também pode adicionar outro hospital, com estoque próprio. Vale na web e no app Android (que ganhou a tela de escolha da unidade; os dados antigos passam para a unidade ICAM).

## 4.16.0
- **Novo nome: PharmaCentral** (antes FarmaLink) no app Android, na plataforma web, nos manifests, no servidor e no README. Módulos: Controle terapêutico e Estoque.
- **Novo ícone**: cápsula em duas metades (uma para cada módulo) com núcleo âmbar em cruz farmacêutica no centro. Aplicado no site, nos PWAs e no launcher do Android (todas as densidades, com ícone adaptativo).
- Arquivo de estilo compartilhado renomeado para `design/pharmacentral.css`.

## 4.15.0
- **Interface da plataforma web reconstruída** sobre um sistema visual único (`design/farmalink.css`, fontes Bricolage e Public Sans embutidas, tema claro e escuro): página inicial com dados reais e exemplo interativo da faixa de dose; Controle terapêutico com lista e ficha lado a lado no computador, medidores de risco de fígado e rim, atalhos de segurança, barra de dose por faixa etária e ficha em tela cheia no celular; Estoque com barra FarmaLink e troca entre módulos, nova tela de entrada e cabeçalho.
- Removidos os arquivos de estilo antigos da página inicial e do servidor.

## 4.14.0
- Marca única: **FarmaLink**. Os módulos deixam de ser apps separados: **Controle terapêutico** (posologia, toxicidade, fichas) e **Estoque** (curva ABC). Vale no app Android, na plataforma web e no repositório (README, manifests, títulos, landing).
- Removida a pasta `tmp/` versionada (cópia antiga do site).
- Android: o CicloDose agora usa a mesma interface do site (filtro por unidade, níveis de toxicidade com fonte, duas abas, recentes e fichas da Policlínica), carregada de `assets/guia.html` dentro do app (WebView, offline). `guia/build.py` copia o arquivo para `flutter_app/assets/`. Links de fonte abrem no navegador do aparelho. FarmaGestão segue nativo.

## 4.13.0 - 2026-11-19

- **Fichas da Policlínica Codajás (lote 1)**: 24 substâncias que cobrem 47 itens da lista (os mais usados por usuários ativos/mês), com indicação, posologia (trecho inicial), mecanismo de ação e alerta em caixa preta **extraídos do rótulo oficial da FDA** (openFDA/DailyMed), com seção e link, mais os níveis de fígado e rim com fontes. Geradas por `tools/mkfichas.py` a partir de `tools/codajas_map.py`.
- Na visão "Policlínica Codajás", as fichas aparecem primeiro; os itens ainda sem ficha ficam num bloco recolhido (119 de 188).
- **Correção**: escores do LiverTox com ressalva de dose alta ([H]/[HD], como insulina, corticoides e propofol) agora ficam limitados a "Moderado" (antes "Alto"), para não exagerar o risco.
- Os rótulos são dos EUA e em inglês; o guia avisa que a posologia no Brasil pode diferir (Anvisa, PCDT).

## 4.12.0 - 2026-11-19

- **Totalmente gratuito e sem conta.** Removidos o cadastro, o login, a assinatura (R$ 29,99/mês), o teste de 7 dias, a integração de pagamento, as telas entrar/assinar/conta/termos, o banco de contas do servidor e o login com Google/Firebase do estoque. A cobrança, se existir um dia, ficará em outro aplicativo.
- **App Android sem login**: abre direto na tela dos módulos e não pede mais a permissão de internet.
- O servidor Docker agora só entrega arquivos estáticos e não guarda nenhum dado.
- O estoque (FarmaGestão) continua salvando só no navegador, com backup em JSON.

## 4.11.0 - 2026-11-19

- **Filtro por unidade** na busca: "Todas as unidades", "ICAM" e "Policlínica Codajás", com contagem em cada botão; a escolha fica guardada no navegador e vale para a busca, as classes e os recentes.
- Na visão Policlínica Codajás, os itens da lista que ainda **não têm monografia** no guia aparecem num bloco recolhido (162 de 188), cada um com atalho para "Buscar em qualquer medicamento". A lista de Codajás é de dispensação ambulatorial (insulinas, biológicos, inalatórios, imunossupressores), diferente do universo hospitalar do ICAM; criar monografias para esses itens é a etapa seguinte.

## 4.10.1 - 2026-11-19

- **Tela inicial só com busca e recentes**: "Consultados recentemente" (os 8 últimos medicamentos abertos, guardados só no navegador); as classes terapêuticas e os favoritos ficam recolhidos em "Ver por classe terapêutica".

## 4.10.0 - 2026-11-19

- **Interface em duas abas**: "Medicamentos" e "Ferramentas" (Dose, Calculadoras, Triagem, Qualquer medicamento, Minha lista, Referências, Sobre).
- **Barra do paciente fixa** no topo da ficha (idade, peso, função renal e hepática, prematuro, gestante); toque para editar. A dose para o paciente agora vem logo após os níveis de fígado e rim.
- **Níveis hepáticos inferidos** para 6 capítulos do LiverTox sem escore (heparina, metadona, ipratropio, tobramicina, neomicina, artemeter+lumefantrina), sinalizados como "inferido"; insulina NPH unificada à insulina humana (rim passa a ter nível).
- **Lista de validação farmacêutica** (`docs/validacao_toxicidade.xlsx` e `.csv`, gerada por `tools/mkvalidacao.py`): 132 linhas, 79 substâncias, com trecho original, link e colunas de decisão.
- GitHub Actions: `cancel-in-progress` desligado no Pages (um deploy não cancela o outro) e actions atualizadas (checkout v5, setup-node v5, setup-python v6, upload-pages-artifact v4).

## 4.9.0 - 2026-11-19

- **Hepatotoxicidade (0 a 4) e nefrotoxicidade (0 a 3) por medicamento**, com a fonte, o link, a seção e o **trecho exato** de onde cada informação foi extraída (bloco "De onde vem" na ficha). Banco `data/toxicidade.json`, gerado por `tools/mktox.py` (caches em `tools/tox/cache/`).
  - Fígado: escore de verossimilhança do **LiverTox (NIH/NIDDK)**, categorias A a E, lido do pacote oficial; modificadores [H]/[HD] limitam o nível a "Alto" e são sinalizados; capítulos sem escore aparecem como "sem escore".
  - Rim: revisão **Pazhayattil & Shirali 2014** (citações conferidas literalmente no texto completo) e **rótulos FDA** (openFDA/DailyMed): caixa preta = 3, Advertências/Precauções = 2, Reações adversas = 1. Frases de interação, pré-condição do paciente e rótulos de associações foram excluídas; 7 substâncias revisadas manualmente. "Sem sinal" não é prova de segurança.
  - Selos de nível aparecem nas listas (fígado alto e rim moderado ou pior) e nas referências.
- **Novo nome do módulo: CicloDose** (antes PosologiaPED), pois a posologia não se restringe à pediatria. O endereço `/guia/` não mudou.
- **Interface mais enxuta**: removidos a aba e o botão Comparar, o botão redundante "Dose do paciente" na ficha e os botões de importação da tela inicial (ficam em Minha lista).
- Conteúdo compilado por IA: exige revisão farmacêutica.

## 4.8.0 - 2026-11-04

- **Autores na página inicial**: byline logo abaixo do título e seção "Autores" (Micael Davi Lima de Oliveira e Elias de Souza Barros, UFAM/FCF).
- **Posologia para todas as faixas etárias**: novo banco `data/posologia.json` (gerado por `tools/mkposologia.py` a partir de `tools/posologia/`), com dose **mínima, recomendada e máxima** por faixa (prematuro, neonato, lactente, criança, adolescente, adulto e idoso), unidade e intervalo explícitos, tetos absolutos e validação automática. Cobre os 216 itens da base e 35 medicamentos adicionais (malária, tuberculose, crônicos). Medicamentos adicionais são pesquisáveis na aba "Dose do paciente".
- **Paciente integrado à ficha**: ao escolher um medicamento, idade, peso, função renal e hepática, prematuridade e gestação entram na ficha e na aba Dose. A faixa etária se ajusta à idade, a dose do paciente é calculada por peso com tetos, e a dose conservadora é usada com insuficiência renal/hepática, neonatos e prematuros.
- **Como o medicamento age**: seção aberta em destaque na ficha e na aba Dose, com mecanismo de ação, ação farmacológica, farmacocinética e fisiopatologia (fichas novas para os itens sem monografia).
- Conteúdo compilado por IA: exige revisão farmacêutica, em especial em prematuros, neonatos e idosos.
- Observação: as versões 4.6 e 4.7 (correções de CI/Pages e APK) não tinham entrada neste arquivo.

## 4.5.0 - 2026-10-28

- **Calculadora do ICAM unificada ao PosologiaPED** (aba "Dose do paciente", web e app): idade, sexo, peso e condições de saúde (insuficiência renal e hepática, gestação/lactação, prematuridade, desidratação, desnutrição, outra condição grave), com TFG estimada (Schwartz/Cockcroft-Gault) a partir da creatinina. Mostra **dose mínima, recomendada e máxima** por administração (mg e mL/comprimidos), por dia e em mg/kg/dia, limitadas pelos tetos diários; número de frascos/ampolas; classificação operacional (controlado/Portaria 344, dose unitária, uso coletivo).
- **Dose prescrita**: avisa **subdose** e **superdose** (e a versão importante de cada), explica o motivo e os **riscos** (por classe e, quando há monografia, efeitos graves e alerta de alta vigilância).
- Nas condições informadas, a dose recomendada passa a ser a **conservadora** (limite inferior da faixa) quando o medicamento tem alerta renal/hepático, em neonatos e prematuros, com aviso para confirmar o ajuste.
- Botão "Dose do paciente" na ficha de cada medicamento; 98 regras de interação na Triagem (as 44 originais + 54 da base do ICAM).
- GitHub Pages: o módulo separado `/calculadora/` foi retirado; tudo fica no PosologiaPED.
- Dados: `data/dose.json` (gerado por `tools/mkdose.py` a partir de `data/icam_medicamentos.json`).

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
