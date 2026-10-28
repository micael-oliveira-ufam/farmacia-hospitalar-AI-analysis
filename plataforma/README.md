# Farmácia Hospitalar Integrada

Plataforma para **qualquer hospital** (nenhum hospital específico), com dois módulos:

| Módulo | O que é |
|---|---|
| **PosologiaPED** (`guia/`) | Posologia **voltada a hospitais pediátricos**: faixa padrão lactentes e crianças, neonatos em seleção própria, alerta pediátrico antes da dose, calculadoras pediátricas primeiro (adultos e idosos só como referência). **Interface em 3 passos:** busca grande ou navegação por **classe terapêutica** (35), **classe farmacológica** (107), forma/seção ou A–Z; lista compacta com a dose da faixa etária escolhida; toque abre o painel de detalhe. Abas: Medicamentos, Qualquer, **Minha lista**, Calculadoras e menu Mais (Cesta, Comparar, Referências, Sobre) |
| **FarmaGestão** (`abc-app/`) | Estoque e Curva ABC: classes A/B/C, estoque de emergência, pedido semanal (PADRÃO e PEDIDO), importação de planilha, backup |

Há também o servidor (`server/`, estáticos e senha opcional), Docker + Cloudflare (link temporário) e o **app Android único** (`flutter_app/`) com os dois módulos.

**Lista de exemplo.** A lista de 224 itens incluída (`data/catalog.json`) foi transcrita de uma lista institucional usada **apenas como exemplo**; ela não define a plataforma. Cada hospital usa a sua: no FarmaGestão importando a planilha do hospital, no PosologiaPED pela aba **Minha lista** (o guia sugere a monografia pelo nome e você confirma).

> **Apoio à decisão, não prescrição.** O conteúdo de doses foi compilado por IA a partir das fontes citadas e **precisa de revisão por farmacêutico responsável**. Veja [docs/METODOLOGIA.md](docs/METODOLOGIA.md) e [docs/REFERENCIAS.md](docs/REFERENCIAS.md).

## O que foi testado e o que não foi
| Parte | Situação |
|---|---|
| Guia web (`guia/`, também offline: sem fontes externas, dados embutidos no HTML e cache por service worker; funciona até abrindo o `index.html` direto) | Testado em navegador headless (busca, cálculo, calculadoras, cesta, comparação, links, celular) e fórmulas com testes automáticos |
| App ABC (`abc-app/`) | Compila (`tsc` + `vite build --base=/estoque/`), 7 testes da lógica de estoque. **Offline** (service worker gerado no build, sem imagens externas): testado em navegador headless desligando a rede, passando por início → FarmaGestão → importação da lista de exemplo → PosologiaPED |
| Servidor (`server/`) | 3 testes automáticos + execução real servindo início, guia e estoque |
| **Docker / docker-compose / cloudflared** | **Não testado**: o ambiente de criação não tinha Docker. Os comandos internos (build, testes, servidor) foram executados manualmente, mas a imagem e o túnel nunca foram subidos |
| **App Flutter / APK** | **Não compilado nem testado**: sem SDK Flutter aqui. O código (inclusive o módulo de estoque novo e `test/abc_test.dart`) passou apenas em verificação de sintaxe; a lógica de estoque em Dart espelha a do TypeScript, que tem testes, mas os testes Dart nunca foram executados. Pode haver erros de compilação a corrigir na primeira build |
| Classes terapêuticas e farmacológicas (`tools/classes.py`) | Atribuídas pelo assistente de IA, inspiradas na lógica do ATC/OMS e **sem conferência item a item** na tabela ATC oficial; revisar com farmacêutico. A interface web foi testada em navegador headless (navegação, busca, painel, celular); no Flutter só a sintaxe foi verificada |
| Links das referências | Níveis de verificação em docs/REFERENCIAS.md (13 conferidos; os demais DOI/site/busca não foram abertos) |

## Início rápido (Docker + link temporário)
```bash
cp .env.example .env        # (recomendado) defina SITE_PASSWORD
./scripts/start.sh          # Windows: .\scripts\start.ps1
./scripts/link.sh           # mostra https://XXXX.trycloudflare.com
./scripts/stop.sh
```
- Local: o script mostra a porta usada (`http://localhost:PORTA` = página inicial com a escolha; `/estoque/` = app ABC; `/guia/` = guia). Se a 8080 estiver ocupada, `start.sh`/`start.ps1` procuram a próxima livre e gravam em `HOST_PORT` no `.env`. Para fixar uma: `HOST_PORT=9090 docker compose up -d`. Sem Docker, `node server.js` também troca de porta sozinho se `PORT` estiver ocupada.
- O link do **Quick Tunnel** é temporário: segundo a [documentação da Cloudflare](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/), não exige conta, o endereço muda a cada execução, não há garantia de disponibilidade, o limite é de 200 requisições simultâneas e SSE não é suportado.
- Domínio fixo: `docker compose --profile named up -d` com `TUNNEL_TOKEN` (requer conta Cloudflare).
- Sem Docker: `cd abc-app && npm ci && npm run build`, `python3 guia/build.py dist_guia`, monte `server/public/abc` (dist do ABC) e `server/public/guia` (index.html, manifest.json, sw.js, icon.svg) e rode `cd server && npm ci && npm start`.

## Contas e assinatura (R$ 29,99/mês, 7 dias de demonstração)
- **Fluxo:** a página inicial (`/`) é pública e deixa escolher o módulo. Ao abrir um módulo sem login, o usuário vai para `/entrar`; **criar a conta dá 7 dias de uso, sem cartão**. Terminada a demonstração, `/assinar` leva ao pagamento. Em `/conta` o usuário vê o plano, abre o portal do Stripe (trocar cartão, cancelar) ou exclui a conta.
- **Cartão:** os dados do cartão são digitados na **página do Stripe Checkout** (hospedada pelo Stripe). Nosso servidor nunca recebe nem guarda número, validade ou CVV, o que evita ter que cumprir o PCI DSS completo. O servidor guarda só e-mail, nome, hash da senha (scrypt) e a situação da assinatura (SQLite em `DATA_DIR`, volume `fhi-data` no Docker).
- **Configurar:** crie uma conta no [Stripe](https://dashboard.stripe.com/), copie a chave secreta de **teste** (`sk_test_...`) para `STRIPE_SECRET_KEY` no `.env` e suba o servidor. No modo teste use o cartão `4242 4242 4242 4242`, qualquer validade futura e CVC. A assinatura é criada na hora com `price_data` (BRL, 2999 centavos, mensal), sem cadastrar produto antes. O webhook (`POST /api/billing/webhook`, `STRIPE_WEBHOOK_SECRET`) é opcional: sem ele, a situação é consultada no Stripe a cada acesso.
- **Produção:** o link temporário do Cloudflare muda a cada execução, serve só para testar. Para cobrar de verdade use domínio fixo com HTTPS (`PUBLIC_URL`), chave `sk_live_...`, webhook registrado, backup do volume de dados e revisão jurídica dos textos em `/termos` (modelo sem assessoria jurídica). Ainda não há recuperação de senha por e-mail nem confirmação de e-mail.
- **App Android:** faz login no mesmo servidor (campo “Servidor” ou `--dart-define=API_BASE=https://seu-dominio` no build) e abre o pagamento no navegador. A verificação da conta vale por **7 dias offline**; depois exige internet. A permissão INTERNET voltou ao app. Na loja Google Play, assinaturas digitais costumam exigir o Google Play Billing (este APK é de instalação direta).
- **Limite:** o conteúdo do guia e do estoque é estático e roda no aparelho; o servidor barra quem não tem conta ao carregar, mas ninguém impede de copiar o que já foi baixado. É controle de acesso comercial, não proteção contra cópia.

## Segurança (decisões de projeto)
- **Sem IA paga.** A integração com o Gemini foi removida. Os preços são digitados à mão em *Preços (CMED)*, com link para a tabela oficial da CMED/Anvisa.
- **Sem login Google.** O acesso usa conta própria (e-mail e senha). O app ABC guarda os dados de estoque **no navegador** (localStorage, com Backup/Restaurar em JSON). Motivo: o login Google/Firebase exige domínios autorizados e o domínio do link temporário muda a cada execução.
- **Firebase opcional:** `VITE_USE_FIREBASE=true` no build do `abc-app`. Exige autorizar o domínio no Firebase Auth e revisar `firestore.rules` (a regra original libera **leitura pública** de `medications`).
- `SITE_PASSWORD` pede senha (HTTP Basic) para o site inteiro, recomendado em link público. Os dados ficam no navegador de cada pessoa; **não insira dados de pacientes**.
- Os preços não são buscados automaticamente: confira na tabela oficial da CMED.

## Integração guia ↔ estoque
- Botão **Importar lista de exemplo** cria os 224 itens no FarmaGestão; itens ligados à lista de exemplo ganham selos (alta vigilância, nefro/hepato) e o link **PosologiaPED** que abre a monografia (`/guia/#caf=CÓDIGO`).
- A **página inicial** (`/`) deixa escolher entre Estoque/Curva ABC e Guia de Doses; ambos têm link “Início”.
- A aba **Qualquer medicamento** do PosologiaPED aceita qualquer nome (também fora da lista carregada): mostra se ele consta na lista e, senão, gera links de pesquisa (DailyMed, PubMed, BNFc, Bulário Anvisa, LiverTox, CMED) e oferece uma calculadora de regime por peso em que a dose é informada pelo usuário a partir da fonte. O guia não inventa doses para fármacos fora da lista.
- A aba **Minha lista** (PosologiaPED) guarda no navegador a lista do hospital (`código;descrição`) e sugere monografias pelo nome (sem inventar doses: sem correspondência, leva às fontes). As sugestões são automáticas e exigem confirmação de sal, associação e apresentação.
- Planilhas importadas no FarmaGestão podem ter coluna `Codigo` (ou `CAF`) para ligar ao PosologiaPED.
- Aba **Pedido semanal**: PADRÃO/PEDIDO, cobertura e exportação em Excel.
- **Offline no navegador:** abra a página inicial uma vez com internet; ela instala o início, o guia e o estoque para uso sem rede (e pode ser “instalada” como app pelo navegador).
- `data/catalog.json` é a fonte única (guia web, app ABC e Flutter): `scripts/sync-catalog.sh`.

## App Android (Flutter)
```bash
./flutter_app/tool/build_apk_docker.sh      # gera dist/farmacia-icam.apk (imagem ghcr.io/cirruslabs/flutter)
```
Ou use o workflow `.github/workflows/build-apk.yml` (GitHub Actions) e baixe o APK em *Artifacts*. O app é **100% offline**: os 224 medicamentos, doses, segurança, calculadoras e o texto das referências vão dentro do APK, e o `patch_android.sh` remove a permissão INTERNET (só abrir um link usa o navegador do aparelho, que precisa de conexão). Itens: lista, filtros, detalhe por faixa etária, favoritos, calculadoras, referências com link. **App único com dois módulos:** a tela inicial deixa escolher entre **PosologiaPED** e **FarmaGestão** (itens, curva ABC, pedido semanal PADRÃO/PEDIDO, importação da planilha do hospital (colada) ou da lista de exemplo, backup JSON compatível com o app web). No Android, exportar/importar usa a área de transferência (copiar/colar CSV e JSON), sem arquivos. No app, a lista tem busca e filtros por classe terapêutica e classe farmacológica. A cesta, a comparação, a aba Qualquer medicamento e a aba Minha lista existem só na versão web. O APK sai assinado com chave de depuração (instalação direta, não Play Store).

## Versões
A versão vigente está em `VERSION` (SemVer) e o histórico em [CHANGELOG.md](CHANGELOG.md). Para lançar uma nova: edite `VERSION`, descreva no CHANGELOG, rode `python3 tools/release.py` (sincroniza pubspec, package.json e catálogo e gera `farmacia-hospitalar-integrada-vX.Y.Z.zip`, com a pasta interna também versionada) e marque com `git tag -a vX.Y.Z`.

## Estrutura
```
guia/        PosologiaPED, versão web (app.js, calc.js, style.css, build.py, test.js)
abc-app/     FarmaGestão (React/Vite) + tests/
server/      Express (+ landing/ = página inicial): estáticos, senha opcional; test/
flutter_app/ app Android único (launcher, guia e estoque ABC) + tool/ (build via Docker)
data/        catalog.json (fonte única), refs.json
tools/       regenera refs/catalog a partir de tools/source/all2.js
docs/        METODOLOGIA.md, REFERENCIAS.md
scripts/     start/stop/link, sync-catalog
```

## Testes
`node guia/test.js` · `cd abc-app && npm test` · `cd server && npm test` · `cd flutter_app && flutter test`

Atribuição: verificações de DOI/metadados feitas segundo o PubMed (NCBI/NLM).

## Listas de hospital (4.3.0)

O guia (PosologiaPED) e a curva ABC (FarmaGestão), na web e no app, têm os botões **Importar lista do ICAM** e **Importar lista da Policlínica Codajás** (`data/catalog.json` e `data/codajas.json`). No guia a lista é cruzada com as monografias pelo nome, de forma automática: confira sempre sal, associação e apresentação.

## Dose do paciente (calculadora ICAM unificada)

A aba **Dose do paciente** substitui a calculadora ICAM separada. Informe idade, sexo, peso e condições (renal, hepática etc.), escolha o medicamento e veja a dose mínima, a recomendada (ponto médio da faixa; conservadora quando há alerta renal/hepático, neonato ou prematuro) e a máxima. Ao digitar a dose prescrita, o sistema avisa subdose ou superdose e lista os riscos. As faixas (mg/kg/dose, tetos diários) vêm da base do ICAM (`data/icam_medicamentos.json`), compilada por IA: **revisão farmacêutica obrigatória**. A base é pediátrica; em adultos a dose é limitada pelo teto cadastrado.

## GitHub Pages (sem servidor)

1. Crie um repositório no GitHub e envie este projeto (branch `main`).
2. Em **Settings → Pages → Build and deployment → Source**, escolha **GitHub Actions**.
3. O workflow `.github/workflows/pages.yml` roda os testes, executa `tools/build_pages.sh` e publica em `https://<usuario>.github.io/<repositorio>/`.

Para gerar localmente: `tools/build_pages.sh _site` e sirva a pasta com qualquer servidor estático. No Pages **não há conta, assinatura nem Stripe** (isso exige o servidor Express/Docker); os dados ficam só no navegador. Funciona offline depois da primeira visita.

## Triagem de prescrição e NoHarm.ai

A aba **Triagem** cruza os medicamentos da prescrição com 44 regras de interação (`data/interacoes.json`), duplicidades, função renal/hepática e faixa etária. Ela é inspirada nas categorias de alerta do [NoHarm.ai](https://github.com/noharm-ai) (licença MIT), mas **não usa código nem dados do NoHarm**: o backend deles é um servidor Flask + PostgreSQL de triagem de prescrições reais de cada hospital e não roda em site estático. Para usar o NoHarm de verdade, a instituição precisa de uma instância própria ou contratada. As regras são compiladas por IA e exigem revisão farmacêutica; não substituem Lexicomp/Micromedex.
