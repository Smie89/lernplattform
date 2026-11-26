"""Kleine Testdatenbank im Arbeitsspeicher (SQLite aus der Standardbibliothek).

Alle Namen und Passwörter sind erfundene Testdaten.
"""

import sqlite3

BENUTZER = [
    ("admin", "Sehr-geheim-2026!"),
    ("anna", "Sommer2026"),  # absichtlich schwaches Passwort für den Wörterbuchangriff
    ("ben", "pferd-batterie-heftklammer-korrekt"),
]

BESTELLUNGEN = [
    (1, "anna", "Monitor"),
    (2, "ben", "Kabel"),
    (3, "anna", "Buch"),
]


def erstellen(passwort_hashen):
    """Legt die Tabellen an; die Passwörter werden mit der übergebenen Funktion gehasht."""
    db = sqlite3.connect(":memory:")
    db.execute("CREATE TABLE benutzer (name TEXT PRIMARY KEY, passwort_hash TEXT NOT NULL)")
    db.execute("CREATE TABLE bestellungen (id INTEGER PRIMARY KEY, besitzer TEXT NOT NULL, artikel TEXT NOT NULL)")
    db.executemany("INSERT INTO benutzer VALUES (?, ?)", [(n, passwort_hashen(p)) for n, p in BENUTZER])
    db.executemany("INSERT INTO bestellungen VALUES (?, ?, ?)", BESTELLUNGEN)
    return db
