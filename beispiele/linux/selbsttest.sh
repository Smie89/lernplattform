#!/usr/bin/env bash
# Prüft die Beispielskripte dieses Ordners. Läuft lokal und in der GitHub Action.
# Aufruf: ./selbsttest.sh
set -uo pipefail   # bewusst ohne -e: Fehlschläge werden gezählt, nicht sofort abgebrochen

cd "$(dirname "$0")"
fehlschlaege=0

pruefe() {   # pruefe <beschreibung> <erwarteter-exit-code> <befehl...>
  local beschreibung="$1" erwartet="$2"
  shift 2
  local ausgabe code
  ausgabe="$("$@" 2>&1)"
  code=$?
  if [[ "$code" -eq "$erwartet" ]]; then
    echo "OK    $beschreibung"
  else
    echo "FEHLER $beschreibung (Exit-Code $code, erwartet $erwartet)"
    echo "$ausgabe" | sed 's/^/        /'
    fehlschlaege=$((fehlschlaege + 1))
  fi
  LETZTE_AUSGABE="$ausgabe"
}

enthaelt() {   # enthaelt <text> – prüft die Ausgabe des letzten pruefe-Aufrufs
  if [[ "$LETZTE_AUSGABE" == *"$1"* ]]; then
    echo "OK      ... Ausgabe enthält '$1'"
  else
    echo "FEHLER  ... Ausgabe enthält '$1' nicht"
    fehlschlaege=$((fehlschlaege + 1))
  fi
}

# --- log-auswertung.sh
pruefe "Log mit Fehlern liefert Exit-Code 1" 1 ./log-auswertung.sh testlauf.log
enthaelt "Fehler:    3"
enthaelt "Warnungen: 2"
enthaelt "WarenkorbTest (2x)"
enthaelt "BestellungTest (1x)"

sauber="$(mktemp)"
grep -v ERROR testlauf.log > "$sauber"
pruefe "Log ohne Fehler liefert Exit-Code 0" 0 ./log-auswertung.sh "$sauber"
enthaelt "alles grün"
rm -f "$sauber"

pruefe "Aufruf ohne Datei liefert Exit-Code 2" 2 ./log-auswertung.sh
pruefe "Nicht vorhandene Datei liefert Exit-Code 2" 2 ./log-auswertung.sh gibt-es-nicht.log

# --- warte-auf-dienst.sh
pruefe "Nicht erreichbare URL bricht nach Timeout ab" 1 ./warte-auf-dienst.sh http://127.0.0.1:59999 2
enthaelt "nicht erreichbar"

# Kleiner Testserver mit Python (python3 unter Linux, unter Windows oft nur "python")
py=""
for kandidat in python3 python; do
  if "$kandidat" -c "import http.server" >/dev/null 2>&1; then py="$kandidat"; break; fi
done

if [[ -n "$py" ]]; then
  "$py" -m http.server 59998 --bind 127.0.0.1 >/dev/null 2>&1 &
  server_pid=$!
  pruefe "Erreichbare URL wird erkannt" 0 ./warte-auf-dienst.sh http://127.0.0.1:59998/ 15
  enthaelt "ist erreichbar"
  kill "$server_pid" 2>/dev/null
  wait "$server_pid" 2>/dev/null
else
  echo "SKIP  Erreichbare URL (kein Python vorhanden)"
fi

echo
if (( fehlschlaege > 0 )); then
  echo "$fehlschlaege Prüfung(en) fehlgeschlagen."
  exit 1
fi
echo "Alle Prüfungen bestanden."
