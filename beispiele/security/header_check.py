"""Prüft die Sicherheits-Header einer Webanwendung – ein kleiner Baustein aus jedem Web-Pentest.

Aufruf:  python header_check.py http://localhost:5000/
Exit-Code 1, wenn Befunde mit Schweregrad "mittel" oder höher vorliegen – so lässt sich das Skript
auch in einer Pipeline einsetzen.

Nur gegen eigene Anwendungen oder mit ausdrücklicher Erlaubnis verwenden.
"""

import sys
import urllib.request

SCHWEREGRADE = ["info", "niedrig", "mittel", "hoch"]


def befunde(url, header):
    """Bewertet die Antwort-Header (dict, Namen in Kleinbuchstaben). Liefert Liste von (schweregrad, text)."""
    ergebnis = []
    https = url.lower().startswith("https://")
    csp = header.get("content-security-policy", "")

    if not csp:
        ergebnis.append(("mittel", "Content-Security-Policy fehlt – eingeschleuste Skripte (XSS) werden nicht blockiert"))
    elif "unsafe-inline" in csp and "script-src" in csp:
        ergebnis.append(("niedrig", "Content-Security-Policy erlaubt 'unsafe-inline' für Skripte"))

    if header.get("x-content-type-options", "").lower() != "nosniff":
        ergebnis.append(("niedrig", "X-Content-Type-Options: nosniff fehlt – Browser darf Dateitypen raten"))

    if "frame-ancestors" not in csp and "x-frame-options" not in header:
        ergebnis.append(("mittel", "Weder X-Frame-Options noch CSP frame-ancestors – Seite kann eingebettet werden (Clickjacking)"))

    if "referrer-policy" not in header:
        ergebnis.append(("niedrig", "Referrer-Policy fehlt – vollständige URLs können an fremde Seiten weitergegeben werden"))

    if https and "strict-transport-security" not in header:
        ergebnis.append(("mittel", "Strict-Transport-Security (HSTS) fehlt"))
    if not https:
        ergebnis.append(("info", "Verbindung ohne TLS – HSTS und Secure-Cookies erst mit HTTPS prüfbar"))

    for name in ("server", "x-powered-by", "x-aspnet-version"):
        if name in header:
            ergebnis.append(("info", f"Header '{name}: {header[name]}' verrät eingesetzte Technik"))

    for cookie in header.get("set-cookie", "").split("\n"):
        if not cookie:
            continue
        name = cookie.split("=", 1)[0]
        attribute = cookie.lower()
        if "httponly" not in attribute:
            ergebnis.append(("mittel", f"Cookie '{name}' ohne HttpOnly – per JavaScript lesbar"))
        if "samesite" not in attribute:
            ergebnis.append(("niedrig", f"Cookie '{name}' ohne SameSite"))
        if https and "secure" not in attribute:
            ergebnis.append(("mittel", f"Cookie '{name}' ohne Secure"))

    return sorted(ergebnis, key=lambda b: -SCHWEREGRADE.index(b[0]))


def header_holen(url):
    # Bandit meldet urlopen (B310), weil damit auch file://-URLs möglich wären. Die URL gibt hier der
    # Aufrufer selbst vor – begründete Ausnahme, siehe Lektion "Sicherheitstests und DevSecOps".
    if not url.lower().startswith(("http://", "https://")):
        raise ValueError(f"Nur http(s)-URLs erlaubt: {url}")
    with urllib.request.urlopen(url, timeout=10) as antwort:  # nosec B310
        header = {}
        for name, wert in antwort.headers.items():
            name = name.lower()
            header[name] = f"{header[name]}\n{wert}" if name in header else wert
        return header


def main(url):
    liste = befunde(url, header_holen(url))
    for schweregrad, text in liste:
        print(f"[{schweregrad:<7}] {text}")
    if not liste:
        print("Keine Befunde.")
    return 1 if any(SCHWEREGRADE.index(s) >= SCHWEREGRADE.index("mittel") for s, _ in liste) else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5000/"))
