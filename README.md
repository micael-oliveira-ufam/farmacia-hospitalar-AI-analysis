<p align="center"><img src="design/icon.svg" alt="Logo do PharmaCentral" width="120"></p>

<h1 align="center">PharmaCentral</h1>

<p align="center"><b>Plataforma de farmácia hospitalar: controle terapêutico, estoque, pedidos e prontuário farmacêutico.</b><br>
Gratuita, sem conta e offline, para web e Android.</p>

<p align="center"><a href="https://micael-oliveira-ufam.github.io/pharmacentral-farmacia-hospitalar/"><b>Acessar a plataforma web</b></a><br>
<sub>https://micael-oliveira-ufam.github.io/pharmacentral-farmacia-hospitalar/</sub></p>

<p align="center"><a href="https://ufam.edu.br"><img src="design/ufam.png" alt="Brasão da Universidade Federal do Amazonas" height="90"></a><br>
<b>Universidade Federal do Amazonas (UFAM)</b></p>

**Autores:** Micael Davi Lima de Oliveira e Elias de Souza Barros  
**Orientadora:** Profa. Dra. Clarice Veloso  
**Preceptora:** Dra. Juliana Carvalho

---

## O que é

O PharmaCentral reúne, em uma só plataforma e para **qualquer hospital**, o trabalho diário da farmácia hospitalar. Roda no navegador e no Android, **sem cadastro, sem conta e sem enviar dado de paciente**: tudo fica no aparelho e funciona offline depois da primeira visita.

| Módulo | Para que serve |
|---|---|
| **Controle terapêutico** (`guia/`) | Posologia do prematuro ao idoso (mínima, recomendada e máxima por faixa etária), mecanismo de ação, nível de hepatotoxicidade (0–4, LiverTox) e de nefrotoxicidade (0–3), com link, seção e trecho de cada fonte. Inclui busca por classe terapêutica e farmacológica, calculadoras, dose ajustada ao paciente (aba *Dose do paciente*), triagem de prescrição (interações, duplicidades, função renal e hepática, faixa etária), manejo dos medicamentos nefro e hepatotóxicos e relatórios em PDF |
| **Estoque** (`abc-app/`) | Curva ABC (classes A, B e C), estoque de emergência, ponto de pedido, pedido semanal (PADRÃO e PEDIDO), importação de planilha, backup, relatório em PDF e a seção **PPS no CAF** |
| **Pedidos** (`modulos/`) | Solicitação do CAF à CEMA e transferência do CAF para a Farmácia Clínica, com número, situação, histórico e impressão |
| **Prontuário** (`modulos/`) | Acompanhamento farmacêutico por número de prontuário (sem nome): prescrição com alerta de fígado e rim, evoluções, intervenções e notificação de reação adversa (escore de Naranjo e ficha em PDF para transcrição no VigiMed) |

**Acesso:** <https://micael-oliveira-ufam.github.io/pharmacentral-farmacia-hospitalar/>

> **Apoio à decisão, não prescrição.** O conteúdo de doses, interações e manejo foi compilado por IA a partir das fontes citadas e **precisa de revisão por farmacêutico responsável**. Veja [docs/METODOLOGIA.md](docs/METODOLOGIA.md) e [docs/REFERENCIAS.md](docs/REFERENCIAS.md). **Não registre nome, CPF nem outro dado que identifique o paciente.**

## PPS no CAF (Estoque, unidade ICAM)

Seção do módulo Estoque, visível ao abrir a unidade **ICAM**, com os **443 produtos para saúde (PPS)** da lista do ICAM no Centro de Abastecimento Farmacêutico. Cada item mostra **foto, descrição, CMM (consumo médio mensal) e função**, com busca por descrição ou código e filtro por categoria. O botão **Gerar relatório em PDF** (no topo e no fim da seção) gera a lista com as fotos, respeitando a busca e a categoria escolhidas.

- **Fotos:** 406 itens têm foto e 37 aparecem como "sem foto". As fotos são **ilustrativas por tipo de produto**, não a marca do item. A origem e a licença de cada uma constam no relatório e ao passar o mouse sobre a foto. Fontes: Wikimedia Commons e Openverse (com autor e licença) e páginas de produto de lojas de materiais hospitalares (Instrumental Técnico, Pague Menos e outras).
- **Função:** texto geral por tipo de produto, para orientação. Não substitui a especificação técnica.
- **CMM:** transcrito de fotos da lista original. O código 4046 teve o valor (30) cortado na borda da foto e está marcado "confirmar".
- **Dados:** `abc-app/public/data/pps.json` e `abc-app/public/pps/` (miniaturas). No Android, `flutter_app/assets/pps.html` é gerado por `tools/mkpps_app.py`.

## Como usar

1. Abra o link da plataforma. Na primeira visita, deixe a página carregar: ela instala o início, os módulos e os dados para uso sem rede (e pode ser instalada como app pelo navegador).
2. **Estoque:** escolha a unidade (ICAM e Policlínica Codajás já vêm com a lista carregada; é possível adicionar outro hospital, com estoque próprio) e importe a planilha de consumo. Use **Backup** para guardar uma cópia ou levar os dados a outro aparelho.
3. **Controle terapêutico:** busque o medicamento, escolha a faixa etária e abra o painel de detalhe. A aba *Minha lista* guarda a lista do hospital (`código;descrição`) e sugere monografias pelo nome, com confirmação de sal, associação e apresentação.
4. **Pedidos e Prontuário:** os registros ficam só no aparelho. Faça backup de vez em quando.

Os dados do Estoque ficam no navegador (localStorage) de cada pessoa. O servidor, quando usado, só entrega arquivos estáticos.

## App Android (Flutter)

App único com os quatro módulos, sem conta. A tela inicial deixa escolher entre Controle terapêutico, Estoque, Pedidos e Prontuário. O Estoque é nativo (curva ABC, pedido semanal, importação da planilha colada, backup JSON compatível com a web); os demais módulos e a seção PPS no CAF (botão **PPS no CAF** no Estoque da unidade ICAM) abrem como páginas offline embutidas no aplicativo. PDFs gerados nessas páginas abrem na folha de compartilhamento do Android.

```bash
./flutter_app/tool/build_apk_docker.sh      # gera dist/farmacia-icam.apk (imagem ghcr.io/cirruslabs/flutter)
```
Ou use o GitHub Actions (`.github/workflows`) e baixe o APK em *Artifacts*. O módulo de estoque nativo do Android ainda não gera PDF.

## O que foi testado e o que não foi

| Parte | Situação |
|---|---|
| Módulos web (guia, estoque, pedidos, prontuário, início) | Testados em navegador headless, no computador e no celular, incluindo a seção PPS no CAF e o relatório em PDF com fotos |
| Fórmulas e lógica de estoque | Testes automáticos: `node guia/test.js`, `cd abc-app && npm test` |
| Servidor (`server/`) | Testes automáticos e execução real servindo início, guia e estoque |
| **Docker / docker-compose / cloudflared** | **Não testado**: o ambiente de criação não tinha Docker. A imagem e o túnel nunca foram subidos |
| **App Flutter / APK** | **Não compilado nem testado**: não há SDK Flutter no ambiente de criação. O código Dart (inclusive o botão PPS no CAF e o cabeçalho do início) não passou por compilação, e os testes Dart nunca foram executados. Pode haver erros a corrigir na primeira build |
| Classes terapêuticas e farmacológicas (`tools/classes.py`) | Atribuídas pelo assistente de IA, inspiradas na lógica do ATC/OMS e **sem conferência item a item** na tabela ATC oficial; revisar com farmacêutico |
| Links das referências | Níveis de verificação em [docs/REFERENCIAS.md](docs/REFERENCIAS.md); parte dos DOIs e sites não foi aberta |
| PPS no CAF | CMM e descrições transcritos de fotos da lista original; fotos ilustrativas, não conferidas contra o produto do ICAM |

## Fontes

- **Posologia, toxicidade e manejo:** fontes citadas em cada ficha, com link e trecho (LiverTox, rótulos FDA, KDIGO, ACG, IDSA, ATS e outras). Lista completa em [docs/REFERENCIAS.md](docs/REFERENCIAS.md); método em [docs/METODOLOGIA.md](docs/METODOLOGIA.md). Verificações de DOI e metadados segundo o PubMed (NCBI/NLM).
- **Listas de medicamentos e PPS:** listas institucionais do ICAM e da Policlínica Codajás, transcritas (`data/catalog.json`, `data/codajas.json`, `abc-app/public/data/pps.json`).
- **Triagem de prescrição:** 44 regras de interação (`data/interacoes.json`), inspiradas nas categorias de alerta do [NoHarm.ai](https://github.com/noharm-ai) (licença MIT). **Não usa código nem dados do NoHarm**. As regras são compiladas por IA, exigem revisão farmacêutica e não substituem Lexicomp ou Micromedex.
- **Preços:** digitados à mão em *Preços (CMED)*, com link para a tabela oficial da CMED/Anvisa. Nada é buscado automaticamente.
- **Fotos dos PPS:** Wikimedia Commons, Openverse e lojas de materiais hospitalares, com crédito por foto.
- Créditos adicionais em [NOTICE.md](NOTICE.md).

## Publicação (GitHub Pages)

O workflow `.github/workflows/pages.yml` roda os testes, executa `tools/build_pages.sh` e publica o site. Para gerar localmente: `bash tools/build_pages.sh _site` e sirva a pasta com qualquer servidor estático. No GitHub Pages **não há conta nem servidor**; os dados ficam só no navegador. Em **Settings → Pages**, a fonte é **GitHub Actions**.

## Servidor opcional (Docker + link temporário)

```bash
cp .env.example .env        # (recomendado) defina SITE_PASSWORD
./scripts/start.sh          # Windows: .\scripts\start.ps1
./scripts/link.sh           # mostra https://XXXX.trycloudflare.com
./scripts/stop.sh
```
- O script mostra a porta usada (`http://localhost:PORTA`). Se a 8080 estiver ocupada, procura a próxima livre e grava em `HOST_PORT` no `.env`.
- O link do **Quick Tunnel** é temporário: segundo a [documentação da Cloudflare](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/trycloudflare/), não exige conta, o endereço muda a cada execução e não há garantia de disponibilidade.
- Domínio fixo: `docker compose --profile named up -d` com `TUNNEL_TOKEN` (requer conta Cloudflare).
- `SITE_PASSWORD` pede senha (HTTP Basic) para o site inteiro, recomendado em link público.
- Sem Docker: `cd server && npm ci && npm start`.

## Estrutura

```
guia/        Controle terapêutico (web): app.js, calc.js, dose.js, triagem.js, build.py
abc-app/     Estoque (React + Vite), PPS no CAF e testes
modulos/     Pedidos e Prontuário (modelos HTML)
pages/       Página inicial e service worker
design/      Sistema visual, logo, brasão da UFAM e gerador de PDF (pcpdf.js)
server/      Servidor Express opcional (estáticos, senha opcional)
flutter_app/ App Android único (início, estoque nativo e módulos embutidos)
data/        Bases de dados (catálogo, toxicidade, posologia, interações, manejo, referências)
tools/       Geradores (landing, módulos, fichas, manejo) e build_pages.sh
docs/        METODOLOGIA.md e REFERENCIAS.md
scripts/     start/stop/link e sincronização do catálogo
```

## Versões

A versão vigente está em `VERSION` (SemVer) e o histórico em [CHANGELOG.md](CHANGELOG.md). Para lançar uma nova: edite `VERSION`, descreva no CHANGELOG e rode `python3 tools/release.py` (sincroniza pubspec, package.json e catálogo e gera o pacote `farmacia-hospitalar-integrada-vX.Y.Z.zip`).

## Testes

`node guia/test.js` · `cd abc-app && npm test` · `cd server && npm test` · `cd flutter_app && flutter test`

## Equipe

**Autores:** Micael Davi Lima de Oliveira e Elias de Souza Barros (Universidade Federal do Amazonas)  
**Orientadora:** Profa. Dra. Clarice Veloso · **Preceptora:** Dra. Juliana Carvalho
