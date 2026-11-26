# KI-Beispiel: Bewertungen klassifizieren und testen

Ein kleiner Naive-Bayes-Klassifikator in **reinem Python** (keine Bibliotheken nötig), der
Kundenbewertungen als positiv oder negativ einstuft – und Tests, wie man sie für KI-Systeme schreibt.
Erklärt im Bereich **🧠 Künstliche Intelligenz**: https://smie89.github.io/lernplattform/lernen/ki

| Datei | Inhalt |
|---|---|
| `daten.py` | 40 Trainings- und 16 Testbewertungen (strikt getrennt) |
| `klassifikator.py` | Naive Bayes mit Bag of Words |
| `auswertung.py` | Konfusionsmatrix, Genauigkeit, Präzision, Sensitivität, F1 |
| `test_klassifikator.py` | Qualitätsschwellen, metamorphe Tests, dokumentierte Schwäche |

```bash
cd beispiele/ki
python auswertung.py          # Metriken auf Trainings- und Testdaten
python -m unittest -v         # Tests (1 erwarteter Fehlschlag: Verneinung)
```

Unter Windows: `python`, unter Linux/macOS meist `python3`. Benötigt Python 3.10 oder neuer.

## Übungsideen

1. Ergänze Trainingsdaten mit neutralen Sätzen über die Lieferung. Wird „Lieferung kam an“ dann nicht mehr als negativ eingestuft?
2. Schreibe eine weitere metamorphe Relation, z. B.: Synonyme („super“ → „toll“) ändern das Ergebnis nicht.
3. Verbessere das Modell für Verneinungen (z. B. „nicht_schlecht“ als ein Wort). Was meldet dann der erwartete Fehlschlag?
