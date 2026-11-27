#!/usr/bin/env bash
# Läuft in der CI innerhalb von android-emulator-runner, wenn der Emulator gebootet ist:
# startet Appium im Hintergrund, wartet, bis es antwortet, führt die Tests aus und beendet Appium wieder.
set -euo pipefail

mkdir -p testergebnisse
appium --port 4723 --log-level info --log appium.log &
appium_pid=$!
trap 'kill "$appium_pid" 2>/dev/null || true' EXIT

for _ in $(seq 1 60); do
  curl -sf http://127.0.0.1:4723/status > /dev/null && break
  sleep 1
done

status=0
pytest -v --junitxml=testergebnisse/appium.xml || status=$?

# Android-Log sichern, bevor der Emulator verschwindet – zeigt Abstürze der App (FATAL EXCEPTION)
adb logcat -d > testergebnisse/logcat.txt || true
exit "$status"
