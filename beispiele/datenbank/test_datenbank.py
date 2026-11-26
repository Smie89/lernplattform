"""Tests für Abfragen, Constraints und Transaktionen.

Aufruf:  python -m unittest -v

Jeder Test bekommt in setUp eine frische Datenbank im Arbeitsspeicher – so beeinflussen sich
Tests nie gegenseitig, und es muss nichts aufgeräumt werden.
"""

import sqlite3
import unittest

import abfragen
import datenbank
from bestellen import BestellFehler, bestellung_anlegen


class DatenbankTest(unittest.TestCase):
    def setUp(self):
        self.db = datenbank.verbinden()

    def tearDown(self):
        self.db.close()

    def wert(self, sql, *parameter):
        return self.db.execute(sql, parameter).fetchone()[0]


class AbfrageTests(DatenbankTest):
    """Lektionen 1 und 2: Ergebnisse der Abfragen gegen bekannte Testdaten prüfen."""

    def test_technikprodukte_absteigend_nach_preis(self):
        namen = [name for name, _ in self.db.execute(abfragen.TECHNIK_NACH_PREIS)]
        self.assertEqual(namen, ["Monitor 27 Zoll", "Funkmaus", "HDMI-Kabel"])

    def test_join_liefert_positionen_einer_bestellung(self):
        zeilen = self.db.execute(abfragen.POSITIONEN_MIT_PRODUKT, (1,)).fetchall()
        self.assertEqual([(produkt, menge) for _, produkt, menge, _ in zeilen], [("HDMI-Kabel", 2), ("Monitor 27 Zoll", 1)])

    def test_left_join_zeigt_kunden_ohne_bestellung_mit_null(self):
        ergebnis = dict(self.db.execute(abfragen.BESTELLUNGEN_PRO_KUNDE).fetchall())
        self.assertEqual(ergebnis["David Sommer"], 0)
        self.assertEqual(ergebnis["Anna Berg"], 2)

    def test_count_stern_zaehlt_die_null_zeile_falsch_mit(self):
        # Dokumentiert den typischen Fehler: COUNT(*) statt COUNT(b.id) bei LEFT JOIN
        ergebnis = dict(self.db.execute(abfragen.BESTELLUNGEN_PRO_KUNDE_FALSCH).fetchall())
        self.assertEqual(ergebnis["David Sommer"], 1)

    def test_umsatz_ohne_stornierte_bestellungen_und_nur_ueber_50_euro(self):
        ergebnis = self.db.execute(abfragen.UMSATZ_PRO_KUNDE).fetchall()
        self.assertEqual(ergebnis, [("Anna Berg", 308.7), ("Ben Kraus", 92.3)])

    def test_unterabfrage_findet_nie_bestellte_produkte(self):
        self.assertEqual(self.db.execute(abfragen.NIE_BESTELLT).fetchall(), [("Funkmaus",)])

    def test_null_vergleich_mit_gleich_findet_nichts(self):
        self.db.execute("CREATE TABLE notizen (text TEXT)")
        self.db.execute("INSERT INTO notizen VALUES (NULL)")
        self.assertEqual(self.wert("SELECT COUNT(*) FROM notizen WHERE text = NULL"), 0)
        self.assertEqual(self.wert("SELECT COUNT(*) FROM notizen WHERE text IS NULL"), 1)


class ConstraintTests(DatenbankTest):
    """Lektion 3: Die Datenbank selbst schützt die Datenqualität."""

    def test_email_muss_eindeutig_sein(self):
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("INSERT INTO kunden (name, email) VALUES ('Anna Zwei', 'anna@example.org')")

    def test_preis_muss_positiv_sein(self):
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("INSERT INTO produkte (id, name, kategorie, preis) VALUES ('x', 'X', 'Y', 0)")

    def test_bestellung_braucht_existierenden_kunden(self):
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("INSERT INTO bestellungen (kunde_id, datum, status) VALUES (999, '2026-11-26', 'offen')")

    def test_status_nur_aus_erlaubter_liste(self):
        with self.assertRaises(sqlite3.IntegrityError):
            self.db.execute("INSERT INTO bestellungen (kunde_id, datum, status) VALUES (1, '2026-11-26', 'verloren')")

    def test_update_ohne_where_trifft_alle_zeilen(self):
        anzahl = self.db.execute("UPDATE produkte SET preis = 1").rowcount
        self.assertEqual(anzahl, 5)  # deshalb: WHERE nie vergessen – und vorher mit SELECT prüfen


class TransaktionsTests(DatenbankTest):
    """Lektion 3: Alles oder nichts."""

    def test_erfolgreiche_bestellung_speichert_alles(self):
        nummer = bestellung_anlegen(self.db, 2, [("buch", 1), ("kabel", 3)])
        self.assertEqual(self.wert("SELECT COUNT(*) FROM positionen WHERE bestellung_id = ?", nummer), 2)
        self.assertEqual(self.wert("SELECT bestand FROM produkte WHERE id = 'kabel'"), 97)

    def test_unbekanntes_produkt_rollt_alles_zurueck(self):
        vorher = self.wert("SELECT COUNT(*) FROM bestellungen")
        with self.assertRaises(BestellFehler):
            bestellung_anlegen(self.db, 2, [("buch", 1), ("gibt-es-nicht", 1)])
        self.assertEqual(self.wert("SELECT COUNT(*) FROM bestellungen"), vorher)
        self.assertEqual(self.wert("SELECT bestand FROM produkte WHERE id = 'buch'"), 25)  # nicht reduziert

    def test_zu_wenig_bestand_rollt_alles_zurueck(self):
        with self.assertRaises(BestellFehler):
            bestellung_anlegen(self.db, 2, [("kabel", 1), ("monitor", 5)])  # nur 4 Monitore da
        self.assertEqual(self.wert("SELECT bestand FROM produkte WHERE id = 'kabel'"), 100)
        self.assertEqual(self.wert("SELECT bestand FROM produkte WHERE id = 'monitor'"), 4)

    def test_einzelpreis_wird_zum_bestellzeitpunkt_festgehalten(self):
        nummer = bestellung_anlegen(self.db, 2, [("buch", 1)])
        self.db.execute("UPDATE produkte SET preis = 44.90 WHERE id = 'buch'")
        self.assertEqual(
            self.wert("SELECT einzelpreis FROM positionen WHERE bestellung_id = ? AND produkt_id = 'buch'", nummer),
            39.9,
        )


class IndexTests(DatenbankTest):
    """Lektion 3: Ein Index verwandelt einen kompletten Tabellendurchlauf in eine gezielte Suche."""

    def plan(self, sql):
        return " ".join(zeile[3] for zeile in self.db.execute("EXPLAIN QUERY PLAN " + sql))

    def test_suche_nach_kunde_nutzt_index(self):
        self.assertIn("USING INDEX idx_bestellungen_kunde", self.plan("SELECT * FROM bestellungen WHERE kunde_id = 1"))

    def test_suche_nach_datum_durchlaeuft_ganze_tabelle(self):
        self.assertIn("SCAN bestellungen", self.plan("SELECT * FROM bestellungen WHERE datum = '2026-11-02'"))


class IsolationsTests(unittest.TestCase):
    """Lektion 4: Jeder Test hat seine eigene Datenbank – Änderungen sind nach dem Test weg."""

    def test_aenderung_in_einer_datenbank(self):
        db = datenbank.verbinden()
        db.execute("DELETE FROM positionen")
        self.assertEqual(db.execute("SELECT COUNT(*) FROM positionen").fetchone()[0], 0)

    def test_andere_datenbank_ist_unberuehrt(self):
        db = datenbank.verbinden()
        self.assertEqual(db.execute("SELECT COUNT(*) FROM positionen").fetchone()[0], 6)


if __name__ == "__main__":
    unittest.main()
