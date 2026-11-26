"""Erzeugt eine frische Testdatenbank im Arbeitsspeicher – für jeden Test eine eigene."""

import sqlite3
from pathlib import Path

ORDNER = Path(__file__).parent


def verbinden(mit_testdaten=True):
    db = sqlite3.connect(":memory:")
    db.execute("PRAGMA foreign_keys = ON")
    db.executescript((ORDNER / "schema.sql").read_text(encoding="utf-8"))
    if mit_testdaten:
        db.executescript((ORDNER / "daten.sql").read_text(encoding="utf-8"))
    return db
