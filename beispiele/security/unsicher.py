"""ABSICHTLICH UNSICHER – nur zum Lernen, niemals so in echten Code übernehmen.

Jede Funktion enthält eine typische Schwachstelle. Die sichere Variante mit denselben
Funktionsnamen steht in sicher.py; test_angriffe.py zeigt die Angriffe gegen beide.
"""

import hashlib
from pathlib import Path


def passwort_hashen(passwort):
    # Schwachstelle: MD5 ist schnell (Milliarden Versuche pro Sekunde auf einer GPU)
    # und ohne Salt -> gleiches Passwort ergibt immer denselben Hash.
    return hashlib.md5(passwort.encode()).hexdigest()


def passwort_pruefen(passwort, gespeichert):
    return passwort_hashen(passwort) == gespeichert


def anmelden(db, name, passwort):
    # Schwachstelle: SQL-Injection – Eingaben werden in den SQL-Text eingebaut.
    sql = (
        f"SELECT name FROM benutzer "
        f"WHERE name = '{name}' AND passwort_hash = '{passwort_hashen(passwort)}'"
    )
    zeile = db.execute(sql).fetchone()
    return zeile[0] if zeile else None


def kommentar_html(autor, text):
    # Schwachstelle: Cross-Site-Scripting (XSS) – Eingaben landen unverändert im HTML.
    return f"<p><b>{autor}</b>: {text}</p>"


def datei_lesen(basis, dateiname):
    # Schwachstelle: Path Traversal – "../" führt aus dem erlaubten Ordner heraus.
    return (Path(basis) / dateiname).read_text(encoding="utf-8")


def bestellung_holen(db, angemeldet, bestell_id):
    # Schwachstelle: Broken Access Control (IDOR) – die Abfrage ist zwar parametrisiert,
    # prüft aber nicht, ob die Bestellung dem angemeldeten Benutzer gehört.
    return db.execute(
        "SELECT id, besitzer, artikel FROM bestellungen WHERE id = ?", (bestell_id,)
    ).fetchone()
