#!/usr/bin/env bash
# Gera o site estático para o GitHub Pages em ./_site (sem servidor, sem conta, sem Stripe).
# Uso: tools/build_pages.sh [diretorio_saida] [pasta_da_calculadora_existente]
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
# 4) Opcional: ferramenta estática já existente (ex.: calculadora ICAM) publicada em /calculadora/
EXTRA="${2:-}"
if [ -n "$EXTRA" ]; then
  mkdir -p "$OUT/calculadora"
  cp -r "$EXTRA"/index.html "$EXTRA"/static "$EXTRA"/data "$OUT/calculadora/"
  python3 - "$OUT/index.html" <<'PY'
import sys
p=sys.argv[1];s=open(p,encoding='utf8').read()
tile='<a class="tile" href="calculadora/"><h2>Calculadora de doses ICAM</h2><p>Avaliação de prescrição, interações, dose por peso, frascos/ampolas e bulário do formulário do ICAM.</p><span class="go">Abrir calculadora →</span></a>'
open(p,'w',encoding='utf8').write(s.replace('<!--EXTRA-->',tile))
PY
fi
touch "$OUT/.nojekyll"
echo "ok: $OUT"
