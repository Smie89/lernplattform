#!/usr/bin/env bash
# Wertet ein Testlog aus: Anzahl der Fehler und Warnungen und welche Tests wie oft
# fehlgeschlagen sind.
#
# Aufruf:  ./log-auswertung.sh <logdatei>
# Exit-Code: 0 = keine Fehler im Log, 1 = Fehler gefunden, 2 = falscher Aufruf
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Aufruf: $0 <logdatei>" >&2
  exit 2
fi

log="$1"
if [[ ! -f "$log" ]]; then
  echo "Datei nicht gefunden: $log" >&2
  exit 2
fi

# Zählt die Zeilen, die das Muster enthalten.
# grep -c gibt bei 0 Treffern Exit-Code 1 zurück – das ist hier kein Fehler.
zaehle() {
  grep -c -- "$1" "$log" || true
}

fehler=$(zaehle " ERROR ")
warnungen=$(zaehle " WARN ")

echo "Auswertung von $log"
echo "  Fehler:    $fehler"
echo "  Warnungen: $warnungen"

if (( fehler > 0 )); then
  echo "Fehlgeschlagene Tests:"
  grep " ERROR " "$log" | awk '{print $4}' | sort | uniq -c | sort -rn |
    while read -r anzahl test; do
      echo "  - $test (${anzahl}x)"
    done
  exit 1
fi

echo "Keine Fehler – alles grün."
