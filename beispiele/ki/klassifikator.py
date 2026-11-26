"""Ein Naive-Bayes-Textklassifikator in reinem Python – ohne Bibliotheken.

Er zählt beim Training, wie oft jedes Wort in positiven und negativen Bewertungen
vorkommt, und berechnet daraus für einen neuen Text, welche Klasse wahrscheinlicher ist.
Bewusst einfach: Er kennt keine Wortreihenfolge ("Bag of Words") – und damit z. B. kein "nicht".
"""

import math
import re
from collections import Counter


def woerter(text: str) -> list[str]:
    """Zerlegt einen Text in kleingeschriebene Wörter (Satzzeichen werden entfernt)."""
    return re.findall(r"[a-zäöüß]+", text.lower())


class NaiveBayes:
    def __init__(self, glaettung: float = 1.0):
        self.glaettung = glaettung          # Laplace-Glättung: unbekannte Wörter nicht 0-mal
        self.klassen: list[str] = []
        self.anzahl_texte: Counter = Counter()
        self.wortzaehler: dict[str, Counter] = {}
        self.vokabular: set[str] = set()

    def trainieren(self, daten: list[tuple[str, str]]) -> "NaiveBayes":
        for text, klasse in daten:
            self.anzahl_texte[klasse] += 1
            zaehler = self.wortzaehler.setdefault(klasse, Counter())
            for wort in woerter(text):
                zaehler[wort] += 1
                self.vokabular.add(wort)
        self.klassen = sorted(self.anzahl_texte)
        return self

    def log_wahrscheinlichkeiten(self, text: str) -> dict[str, float]:
        gesamt = sum(self.anzahl_texte.values())
        ergebnis = {}
        for klasse in self.klassen:
            zaehler = self.wortzaehler[klasse]
            woerter_der_klasse = sum(zaehler.values())
            log_p = math.log(self.anzahl_texte[klasse] / gesamt)          # A-priori-Wahrscheinlichkeit
            for wort in woerter(text):
                if wort not in self.vokabular:
                    continue                                              # unbekannte Wörter ignorieren
                p = (zaehler[wort] + self.glaettung) / (woerter_der_klasse + self.glaettung * len(self.vokabular))
                log_p += math.log(p)
            ergebnis[klasse] = log_p
        return ergebnis

    def wahrscheinlichkeit(self, text: str, klasse: str) -> float:
        """Wahrscheinlichkeit (0..1), dass der Text zur Klasse gehört."""
        logs = self.log_wahrscheinlichkeiten(text)
        maximum = max(logs.values())
        exp = {k: math.exp(v - maximum) for k, v in logs.items()}
        return exp[klasse] / sum(exp.values())

    def vorhersagen(self, text: str) -> str:
        logs = self.log_wahrscheinlichkeiten(text)
        return max(logs, key=logs.get)
