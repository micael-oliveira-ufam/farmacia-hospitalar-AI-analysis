#!/usr/bin/env bash
# Gera o site estático para o GitHub Pages em ./_site (sem servidor, sem conta, sem Stripe).
# Uso: tools/build_pages.sh [diretorio_saida]
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="$(realpath -m "${1:-_site}")"
rm -rf "$OUT"; mkdir -p "$OUT/shared"
# 1) Estoque (caminhos relativos para funcionar em /<repo>/estoque/)
( cd abc-app && npm ci --silent && VITE_HOME_URL=../ VITE_GUIDE_URL=../guia/ npx vite build --base=./ --outDir "$OUT/estoque" --emptyOutDir )
python3 - "$OUT/estoque/index.html" <<'PY'
import re,sys
p=sys.argv[1];s=open(p,encoding='utf8').read()
s=re.sub(r'<script src="/shared/account.js"[^>]*></script>\n?','',s)
open(p,'w',encoding='utf8').write(s)
PY
# 2) Controle terapêutico (sem script de conta)
python3 guia/build.py "$OUT/guia" pages
rm -f "$OUT/guia/guia-artifact.html"
# 2b) Pedidos e Prontuário
python3 tools/mkmodulos.py "$OUT"
# 3) Página inicial (gerada com os números reais dos dados) e sistema visual compartilhado
python3 tools/mklanding.py
cp pages/index.html pages/manifest.json pages/sw.js "$OUT/"
cp design/icon.svg "$OUT/icon.svg"
mkdir -p "$OUT/shared/fonts"
cp design/pharmacentral.css "$OUT/shared/pharmacentral.css"; cp design/ufam.png "$OUT/shared/ufam.png"
cp design/fonts/*.woff2 "$OUT/shared/fonts/"
touch "$OUT/.nojekyll"
echo "ok: $OUT"
