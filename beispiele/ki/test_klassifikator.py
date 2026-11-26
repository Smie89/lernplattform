"""Tests für ein KI-System – mit der Standardbibliothek (unittest).

Aufruf:  python -m unittest -v

Bei KI-Systemen gibt es oft kein exaktes Orakel ("Was ist die richtige Antwort für jeden Text?").
Deshalb drei Arten von Tests:
  1. Qualitätsschwellen auf einem festen Testdatensatz (Evaluierung)
  2. Metamorphe Tests: Wie muss sich die Ausgabe ändern (oder eben nicht), wenn man die Eingabe gezielt verändert?
  3. Bekannte Schwächen, als erwarteter Fehlschlag dokumentiert
"""

import unittest

from auswertung import metriken
from daten import TEST, TRAINING
from klassifikator import NaiveBayes


class QualitaetsTests(unittest.TestCase):
    """Evaluierung: feste Mindestwerte auf Daten, die das Modell beim Training nicht gesehen hat."""

    @classmethod
    def setUpClass(cls):
        cls.modell = NaiveBayes().trainieren(TRAINING)
        cls.m = metriken(cls.modell, TEST)

    def test_genauigkeit_mindestens_85_prozent(self):
        self.assertGreaterEqual(self.m["genauigkeit"], 0.85)

    def test_negative_bewertungen_werden_zuverlaessig_gefunden(self):
        # Recall ist hier wichtiger als Präzision: Ein übersehener unzufriedener Kunde ist teurer
        # als eine positive Bewertung, die versehentlich nachgeprüft wird.
        self.assertGreaterEqual(self.m["sensitivitaet"], 0.90)

    def test_trainings_und_testdaten_ueberschneiden_sich_nicht(self):
        trainingstexte = {text for text, _ in TRAINING}
        self.assertFalse([text for text, _ in TEST if text in trainingstexte])

    def test_datensatz_ist_ausgewogen(self):
        for daten in (TRAINING, TEST):
            labels = [label for _, label in daten]
            self.assertEqual(labels.count("positiv"), labels.count("negativ"))


class MetamorpheTests(unittest.TestCase):
    """Metamorphe Relationen: Wir kennen nicht für jeden Text das richtige Ergebnis –
    aber wir wissen, wie sich das Ergebnis bei bestimmten Änderungen verhalten MUSS."""

    BEISPIELE = [text for text, _ in TEST]

    @classmethod
    def setUpClass(cls):
        cls.modell = NaiveBayes().trainieren(TRAINING)

    def test_gross_und_kleinschreibung_aendert_nichts(self):
        for text in self.BEISPIELE:
            with self.subTest(text=text):
                self.assertEqual(self.modell.vorhersagen(text), self.modell.vorhersagen(text.upper()))

    def test_satzzeichen_aendern_nichts(self):
        for text in self.BEISPIELE:
            with self.subTest(text=text):
                self.assertEqual(self.modell.vorhersagen(text), self.modell.vorhersagen(text + "!!! ..."))

    def test_neutraler_zusatz_aendert_das_ergebnis_nicht(self):
        for text in self.BEISPIELE:
            with self.subTest(text=text):
                self.assertEqual(self.modell.vorhersagen(text),
                                 self.modell.vorhersagen(text + ". Bestellt am Dienstag."))

    def test_mehr_lob_macht_positiv_nicht_unwahrscheinlicher(self):
        text = "Lieferung kam an"
        vorher = self.modell.wahrscheinlichkeit(text, "positiv")
        nachher = self.modell.wahrscheinlichkeit(text + ", super Qualität", "positiv")
        self.assertGreater(nachher, vorher)

    def test_mehr_kritik_macht_negativ_nicht_unwahrscheinlicher(self):
        text = "Lieferung kam an"
        vorher = self.modell.wahrscheinlichkeit(text, "negativ")
        nachher = self.modell.wahrscheinlichkeit(text + ", leider beschädigt", "negativ")
        self.assertGreater(nachher, vorher)


class BekannteSchwaechen(unittest.TestCase):
    """Ein Bag-of-Words-Modell kennt keine Wortreihenfolge – Verneinungen versteht es nicht.
    Der Test beschreibt das GEWÜNSCHTE Verhalten und ist als erwarteter Fehlschlag markiert:
    Wird das Modell verbessert, meldet unittest einen 'unexpected success'."""

    @unittest.expectedFailure
    def test_verneinung_kehrt_die_bewertung_um(self):
        modell = NaiveBayes().trainieren(TRAINING)
        self.assertEqual(modell.vorhersagen("Die Qualität ist nicht schlecht, ich bin nicht enttäuscht"), "positiv")


if __name__ == "__main__":
    unittest.main(verbosity=2)
