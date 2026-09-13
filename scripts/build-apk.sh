#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
export JAVA_HOME="${JAVA_HOME:-/usr/lib/jvm/java-21-openjdk-amd64}"
export ANDROID_HOME="${ANDROID_HOME:-$HOME/Android/Sdk}"
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/platform-tools:$PATH"

if [[ ! -d "$ANDROID_HOME/platforms/android-35" ]]; then
  echo "Android SDK missing at $ANDROID_HOME" >&2
  exit 1
fi

# Do not pack an existing APK into the next APK.
mkdir -p "$ROOT/public/downloads" "$ROOT/releases"
find "$ROOT/public/downloads" -name "*.apk" -delete || true

cd "$ROOT"
MOBILE_EXPORT=1 npx next build
npx cap sync android

cat > "$ROOT/android/local.properties" <<EOF
sdk.dir=$ANDROID_HOME
EOF

cd "$ROOT/android"
./gradlew assembleDebug --no-daemon

SRC="$(find "$ROOT/android/app/build/outputs/apk" -name "*.apk" | head -n 1)"
cp "$SRC" "$ROOT/public/downloads/67-clicker.apk"
cp "$SRC" "$ROOT/releases/67-clicker.apk"
echo "APK ready: $ROOT/public/downloads/67-clicker.apk"
ls -lh "$ROOT/public/downloads/67-clicker.apk"
