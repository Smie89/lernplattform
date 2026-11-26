"""Tests für die Erkennungsregeln – auch Detektionen brauchen Tests (Detection Engineering)."""

import unittest
from pathlib import Path

from log_analyse import brute_force, ereignisse, erfolg_nach_fehlversuchen

LOG = Path(__file__).with_name("auth.log").read_text(encoding="utf-8").splitlines()


class ErkennungsTests(unittest.TestCase):

    def test_nur_anmeldezeilen_werden_ausgewertet(self):
        self.assertEqual(len(list(ereignisse(LOG))), 31)  # 34 Zeilen, davon 3 andere Meldungen

    def test_brute_force_wird_erkannt(self):
        self.assertEqual(brute_force(LOG)["203.0.113.7"], 12)

    def test_ein_tippfehler_ist_kein_angriff(self):
        self.assertNotIn("198.51.100.23", brute_force(LOG))

    def test_erfolgreicher_angriff_loest_kritischen_alarm_aus(self):
        alarme = erfolg_nach_fehlversuchen(LOG)
        self.assertEqual([(benutzer, ip) for _, benutzer, ip, _ in alarme], [("ben", "192.0.2.50")])

    def test_langsamer_angriff_unterlaeuft_das_zeitfenster(self):
        # Bekannte Grenze der Regel: 8 Versuche im Abstand von 10 Minuten bleiben unter der Schwelle.
        self.assertNotIn("203.0.113.99", brute_force(LOG))

    def test_langsamer_angriff_mit_tagesfenster(self):
        # Eine zweite Regel mit großem Fenster fängt ihn – dafür mehr Fehlalarme bei vergesslichen Nutzern.
        self.assertIn("203.0.113.99", brute_force(LOG, schwelle=8, fenster_sekunden=24 * 3600))

    def test_fremde_zeilen_werden_ignoriert(self):
        self.assertEqual(brute_force(["kaputte Zeile", ""]), {})


if __name__ == "__main__":
    unittest.main()
