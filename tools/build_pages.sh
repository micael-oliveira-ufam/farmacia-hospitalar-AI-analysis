#!/usr/bin/env bash
# Gera o site estático para o GitHub Pages em ./_site (sem servidor, sem conta, sem Stripe).
# Uso: tools/build_pages.sh [diretorio_saida]
set -euo pipefail
cd "$(dirname "$0")/.."
OUT="$(realpath -m "${1:-_site}")"
rm -rf "$OUT"; mkdir -p "$OUT/shared" "$OUT/icons"
# 1) FarmaGestão (caminhos relativos para funcionar em /<repo>/estoque/)
( cd abc-app && npm ci --silent && VITE_HOME_URL=../ VITE_GUIDE_URL=../guia/ npx vite build --base=./ --outDir "$OUT/estoque" --emptyOutDir )
python3 - "$OUT/estoque/index.html" <<'PY'
import re,sys
p=sys.argv[1];s=open(p,encoding='utf8').read()
s=re.sub(r'<script src="/shared/account.js"[^>]*></script>\n?','',s)
open(p,'w',encoding='utf8').write(s)
PY
# 2) PosologiaPED (sem script de conta)
python3 guia/build.py "$OUT/guia" pages
rm -f "$OUT/guia/guia-artifact.html"
# 3) Página inicial
cp pages/index.html pages/manifest.json pages/sw.js "$OUT/"
cp server/landing/icon.svg "$OUT/icon.svg"
sed 's#/shared/bar.css#bar.css#' server/landing/shared/ui.css > "$OUT/shared/ui.css"
cp server/landing/shared/bar.css "$OUT/shared/bar.css"
cp server/landing/icons/ped.svg server/landing/icons/gestao.svg "$OUT/icons/"
touch "$OUT/.nojekyll"
echo "ok: $OUT"
