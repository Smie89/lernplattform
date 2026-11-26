"""Angriffe in SSH-Logs erkennen – wie eine einfache Erkennungsregel in einem SOC/SIEM.

Aufruf:  python log_analyse.py auth.log

Erkennt:
  1. Brute Force: viele Fehlversuche einer IP innerhalb kurzer Zeit
  2. Erfolgreiche Anmeldung NACH vielen Fehlversuchen derselben IP – das wichtigste Alarmsignal:
     Hier hat ein Angriff vermutlich funktioniert.
"""

import re
import sys
from collections import defaultdict, deque
from datetime import datetime

MONATE = {m: i for i, m in enumerate(
    ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], start=1)}

# Beispiel: Nov 26 10:15:01 web01 sshd[1234]: Failed password for invalid user admin from 203.0.113.7 port 52311 ssh2
MUSTER = re.compile(
    r"^(?P<monat>\w{3})\s+(?P<tag>\d+) (?P<zeit>[\d:]{8}) \S+ sshd\[\d+\]: "
    r"(?P<ergebnis>Failed|Accepted) \w+ for (?:invalid user )?(?P<benutzer>\S+) from (?P<ip>[\d.]+)"
)


def ereignisse(zeilen, jahr=2026):
    """Liefert (zeitpunkt, ergebnis, benutzer, ip) für jede SSH-Anmeldezeile; alles andere wird übersprungen."""
    for zeile in zeilen:
        treffer = MUSTER.match(zeile)
        if not treffer:
            continue
        stunde, minute, sekunde = map(int, treffer["zeit"].split(":"))
        zeitpunkt = datetime(jahr, MONATE[treffer["monat"]], int(treffer["tag"]), stunde, minute, sekunde)
        yield zeitpunkt, treffer["ergebnis"], treffer["benutzer"], treffer["ip"]


def brute_force(zeilen, schwelle=5, fenster_sekunden=60):
    """IPs mit mindestens `schwelle` Fehlversuchen innerhalb von `fenster_sekunden` (gleitendes Fenster).

    Rückgabe: {ip: höchste Anzahl Fehlversuche in einem Fenster}
    """
    fenster = defaultdict(deque)
    hoechstwert = {}
    for zeitpunkt, ergebnis, _, ip in ereignisse(zeilen):
        if ergebnis != "Failed":
            continue
        f = fenster[ip]
        f.append(zeitpunkt)
        while (zeitpunkt - f[0]).total_seconds() > fenster_sekunden:
            f.popleft()
        if len(f) >= schwelle:
            hoechstwert[ip] = max(hoechstwert.get(ip, 0), len(f))
    return hoechstwert


def erfolg_nach_fehlversuchen(zeilen, schwelle=5):
    """Erfolgreiche Anmeldungen von IPs, die vorher mindestens `schwelle` Fehlversuche hatten.

    Rückgabe: Liste von (zeitpunkt, benutzer, ip, fehlversuche_vorher)
    """
    fehlversuche = defaultdict(int)
    alarme = []
    for zeitpunkt, ergebnis, benutzer, ip in ereignisse(zeilen):
        if ergebnis == "Failed":
            fehlversuche[ip] += 1
        elif fehlversuche[ip] >= schwelle:
            alarme.append((zeitpunkt, benutzer, ip, fehlversuche[ip]))
    return alarme


def bericht(zeilen):
    zeilen = list(zeilen)
    ausgabe = ["Brute-Force-Verdacht (>= 5 Fehlversuche in 60 s):"]
    for ip, anzahl in sorted(brute_force(zeilen).items(), key=lambda e: -e[1]):
        ausgabe.append(f"  {ip:<16} {anzahl} Fehlversuche")
    ausgabe.append("KRITISCH - erfolgreiche Anmeldung nach Fehlversuchen:")
    for zeitpunkt, benutzer, ip, anzahl in erfolg_nach_fehlversuchen(zeilen):
        ausgabe.append(f"  {zeitpunkt:%d.%m. %H:%M:%S}  {benutzer} von {ip} nach {anzahl} Fehlversuchen")
    return "\n".join(ausgabe)


if __name__ == "__main__":
    pfad = sys.argv[1] if len(sys.argv) > 1 else "auth.log"
    with open(pfad, encoding="utf-8") as datei:
        print(bericht(datei))
