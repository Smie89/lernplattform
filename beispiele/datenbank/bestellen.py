"""Bestellung anlegen – alles oder nichts dank Transaktion (Lektion 3)."""

import sqlite3


class BestellFehler(Exception):
    pass


def bestellung_anlegen(db, kunde_id, positionen, datum="2026-11-26"):
    """positionen: Liste von (produkt_id, menge). Gibt die neue Bestellnummer zurück.

    Entweder werden Bestellung, alle Positionen und alle Bestandsänderungen gespeichert –
    oder gar nichts (Rollback).
    """
    try:
        with db:  # Transaktion: COMMIT bei Erfolg, ROLLBACK bei jeder Exception
            cursor = db.execute(
                "INSERT INTO bestellungen (kunde_id, datum, status) VALUES (?, ?, 'offen')",
                (kunde_id, datum),
            )
            bestellung_id = cursor.lastrowid
            for produkt_id, menge in positionen:
                zeile = db.execute("SELECT preis FROM produkte WHERE id = ?", (produkt_id,)).fetchone()
                if zeile is None:
                    raise BestellFehler(f"Unbekanntes Produkt: {produkt_id}")
                db.execute(
                    "INSERT INTO positionen (bestellung_id, produkt_id, menge, einzelpreis) VALUES (?, ?, ?, ?)",
                    (bestellung_id, produkt_id, menge, zeile[0]),
                )
                # CHECK (bestand >= 0) schlägt fehl, wenn nicht genug da ist
                db.execute("UPDATE produkte SET bestand = bestand - ? WHERE id = ?", (menge, produkt_id))
            return bestellung_id
    except sqlite3.IntegrityError as fehler:
        raise BestellFehler(f"Bestellung abgelehnt: {fehler}") from fehler
