#!/usr/bin/env bash
# Ajusta o AndroidManifest gerado pelo "flutter create": nome do app e permissão de consulta para abrir links https.
set -euo pipefail
M="android/app/src/main/AndroidManifest.xml"
[ -f "$M" ] || { echo "AndroidManifest não encontrado"; exit 1; }
sed -i 's#android:label="[^"]*"#android:label="FarmaLink"#' "$M"
if ! grep -q 'android:scheme="https"' "$M"; then
  sed -i 's#<queries>#<queries>\n        <intent>\n            <action android:name="android.intent.action.VIEW" />\n            <data android:scheme="https" />\n        </intent>#' "$M"
fi
echo "AndroidManifest ajustado."
