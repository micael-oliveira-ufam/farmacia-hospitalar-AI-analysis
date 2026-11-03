#!/usr/bin/env bash
# Roda DENTRO de um ambiente com Flutter (imagem Docker ou GitHub Actions), na pasta flutter_app.
# A pasta android/ NÃO é versionada: é gerada aqui pelo "flutter create" (embedding v2),
# e depois recebe os ícones próprios de tool/icons/.
set -euo pipefail
cd "$(dirname "$0")/.."
if [ ! -f android/app/build.gradle ] && [ ! -f android/app/build.gradle.kts ]; then
  rm -rf android
  flutter create --platforms=android --org app.farmaciaintegrada --project-name farmacia_integrada .
fi
cp -r tool/icons/res/. android/app/src/main/res/
rm -f test/widget_test.dart
bash tool/patch_android.sh
flutter pub get
flutter analyze || echo "(analyze com avisos: revise acima)"
flutter test
flutter build apk --release
echo
echo "APK: $(pwd)/build/app/outputs/flutter-apk/app-release.apk"
