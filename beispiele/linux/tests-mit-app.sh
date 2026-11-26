#!/usr/bin/env bash
# Startet den Mini-Shop im Hintergrund, wartet, bis er antwortet, führt Tests gegen
# die laufende Anwendung aus und beendet sie danach wieder – auch wenn Tests fehlschlagen.
#
# Aufruf (im Ordner beispiele/shop, nach "dotnet build"):
#   ../linux/tests-mit-app.sh                       # Standard: UI-Tests gegen die laufende App
#   ../linux/tests-mit-app.sh curl -sf http://localhost:5000/api/produkte   # eigener Befehl
# Exit-Code: der des Testbefehls (bzw. 1, wenn die Anwendung nicht startet)
set -euo pipefail

port="${PORT:-5000}"
url="http://localhost:$port"
skriptordner="$(cd "$(dirname "$0")" && pwd)"
app_log="$(mktemp)"

# Kein "dotnet run": Es startet die Anwendung als Kindprozess, den ein kill nicht sicher mitbeendet.
# Start im Projektordner, damit die Anwendung ihre Dateien (wwwroot) findet; "exec" ersetzt die
# Subshell durch dotnet – so ist $! wirklich die PID der Anwendung.
(cd src/Shop.Web && exec dotnet bin/Debug/net10.0/Shop.Web.dll --urls "$url") > "$app_log" 2>&1 &
app_pid=$!

aufraeumen() {
  echo "Beende Anwendung (PID $app_pid) ..."
  kill "$app_pid" 2>/dev/null || true
  wait "$app_pid" 2>/dev/null || true
  rm -f "$app_log"
}
trap aufraeumen EXIT   # läuft immer am Ende – bei Erfolg, Fehler oder Strg+C

if ! "$skriptordner/warte-auf-dienst.sh" "$url/api/produkte" 60; then
  echo "Die Anwendung ist nicht gestartet. Letzte Logzeilen:" >&2
  tail -n 20 "$app_log" >&2
  exit 1
fi

if (( $# > 0 )); then
  "$@"                                             # eigener Testbefehl
else
  SHOP_URL="$url" dotnet test tests/Shop.UiTests   # UI-Tests gegen die laufende Anwendung
fi
