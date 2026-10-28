#!/usr/bin/env bash
# Roda DENTRO de um ambiente com Flutter (imagem Docker ou GitHub Actions), na pasta flutter_app.
set -euo pipefail
cd "$(dirname "$0")/.."
if [ ! -d android ]; then
  flutter create --platforms=android --org app.farmaciaintegrada --project-name farmacia_integrada .
fi
rm -f test/widget_test.dart
bash tool/patch_android.sh
flutter pub get
flutter analyze || echo "(analyze com avisos: revise acima)"
flutter test
flutter build apk --release
echo
echo "APK: $(pwd)/build/app/outputs/flutter-apk/app-release.apk"
