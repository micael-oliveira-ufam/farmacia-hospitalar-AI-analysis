#!/usr/bin/env bash
# Compila o APK sem instalar o Flutter: usa a imagem Docker comunitária do Flutter (ghcr.io/cirruslabs/flutter).
# Primeira execução baixa ~2-3 GB e leva vários minutos.
set -euo pipefail
cd "$(dirname "$0")/.."
docker run --rm -v "$PWD":/app -w /app ghcr.io/cirruslabs/flutter:stable bash tool/in_container.sh
mkdir -p ../dist && cp build/app/outputs/flutter-apk/app-release.apk ../dist/farmacia-hospitalar-integrada.apk
echo "Pronto: dist/farmacia-hospitalar-integrada.apk"
