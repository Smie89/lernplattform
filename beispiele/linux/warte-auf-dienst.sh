#!/usr/bin/env bash
# Wartet, bis eine URL erfolgreich antwortet (HTTP 2xx/3xx) – z. B. bevor Tests
# gegen eine frisch gestartete Anwendung laufen.
#
# Aufruf:  ./warte-auf-dienst.sh <url> [timeout-sekunden]
# Beispiel: ./warte-auf-dienst.sh http://localhost:5000/api/produkte 60
# Exit-Code: 0 = erreichbar, 1 = Timeout
set -euo pipefail

url="${1:?Aufruf: $0 <url> [timeout-sekunden]}"
timeout="${2:-60}"
ende=$(( SECONDS + timeout ))

echo "Warte auf $url (max. ${timeout} s) ..."
until curl -sf -o /dev/null "$url"; do
  if (( SECONDS >= ende )); then
    echo "FEHLER: $url nach ${timeout} s nicht erreichbar." >&2
    exit 1
  fi
  sleep 1
done
echo "OK: $url ist erreichbar."
