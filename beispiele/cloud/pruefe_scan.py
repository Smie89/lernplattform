"""Wertet das Checkov-Ergebnis für unsicher/ aus und hält Treffer UND Lücken des Scanners fest.

Aufruf (in der CI):
    checkov -d unsicher --framework terraform -o json > checkov.json || true
    python pruefe_scan.py checkov.json
"""

import json
import sys

# Diese Befunde MUSS der Scanner in unsicher/ melden.
ERWARTET = {
    "CKV_AZURE_44": "veraltete TLS-Version",
    "CKV_AZURE_59": "Speicherkonto öffentlich erreichbar",
    "CKV_AZURE_190": "Blobs öffentlich lesbar",
    "CKV_AZURE_9": "RDP aus dem Internet",
    "CKV_AZURE_10": "SSH aus dem Internet",
}

# Bekannte Lücke: https_traffic_only_enabled = false wird NICHT erkannt, weil die Regel noch den
# alten Attributnamen enable_https_traffic_only prüft (umbenannt in azurerm 4.0).
# Meldet der Scanner es irgendwann doch, schlägt dieses Skript an – dann die Lektion aktualisieren.
BEKANNTE_LUECKE = "CKV_AZURE_3"


def main(pfad):
    daten = json.load(open(pfad, encoding="utf-8"))
    ergebnis = (daten[0] if isinstance(daten, list) else daten)["results"]
    gefunden = {pruefung["check_id"] for pruefung in ergebnis["failed_checks"]}

    fehler = [f"{cid} ({text}) nicht gemeldet" for cid, text in ERWARTET.items() if cid not in gefunden]
    if BEKANNTE_LUECKE in gefunden:
        fehler.append(f"{BEKANNTE_LUECKE} wird jetzt erkannt – Lücke geschlossen, Lektion anpassen")

    print(f"Checkov meldet in unsicher/ {len(gefunden)} Befunde, davon {len(ERWARTET)} geprüft.")
    for zeile in fehler:
        print("FEHLER:", zeile)
    return 1 if fehler else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))
