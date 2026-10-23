#!/usr/bin/env bash
# Ajusta o AndroidManifest gerado pelo "flutter create": nome do app e permissão de consulta para abrir links https.
set -euo pipefail
M="android/app/src/main/AndroidManifest.xml"
[ -f "$M" ] || { echo "AndroidManifest não encontrado"; exit 1; }
sed -i 's#android:label="[^"]*"#android:label="Farmácia Integrada"#' "$M"
if ! grep -q 'android:scheme="https"' "$M"; then
  sed -i 's#<queries>#<queries>\n        <intent>\n            <action android:name="android.intent.action.VIEW" />\n            <data android:scheme="https" />\n        </intent>#' "$M"
fi
# App 100% offline: o catálogo vai dentro do APK, então NÃO pedimos a permissão INTERNET.
# (Abrir um link entrega a URL ao navegador do aparelho, que não depende desta permissão.)
sed -i '/android.permission.INTERNET/d' "$M"
for f in android/app/src/debug/AndroidManifest.xml android/app/src/profile/AndroidManifest.xml; do
  [ -f "$f" ] && sed -i '/android.permission.INTERNET/d' "$f" || true
done
if grep -rq "android.permission.INTERNET" android/app/src 2>/dev/null; then echo "AVISO: INTERNET ainda presente"; else echo "Sem permissão INTERNET (app offline)."; fi
echo "AndroidManifest ajustado."
