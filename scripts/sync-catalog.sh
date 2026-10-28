#!/usr/bin/env bash
# Mantém o mesmo catálogo (data/catalog.json) no guia web, no app ABC e no app Flutter.
set -euo pipefail
cd "$(dirname "$0")/.."
cp data/catalog.json abc-app/public/data/catalog.json
cp data/catalog.json flutter_app/assets/catalog.json
cp data/codajas.json abc-app/public/data/codajas.json
cp data/codajas.json flutter_app/assets/codajas.json
echo "catalog.json sincronizado."
cp data/interacoes.json flutter_app/assets/interacoes.json
