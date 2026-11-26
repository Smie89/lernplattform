"""Trainiert den Klassifikator und misst seine Qualität auf Trainings- und Testdaten.

Aufruf:  python auswertung.py
"""

from daten import TEST, TRAINING
from klassifikator import NaiveBayes


def metriken(modell: NaiveBayes, daten, positiv: str = "negativ") -> dict:
    """Konfusionsmatrix und Kennzahlen. 'positiv' ist die Klasse, die wir FINDEN wollen –
    hier die negativen Bewertungen (z. B. um unzufriedene Kunden schnell zu erkennen)."""
    tp = fp = fn = tn = 0
    fehler = []
    for text, wahr in daten:
        vorhergesagt = modell.vorhersagen(text)
        if vorhergesagt == positiv and wahr == positiv:
            tp += 1
        elif vorhergesagt == positiv and wahr != positiv:
            fp += 1
            fehler.append((text, wahr, vorhergesagt))
        elif vorhergesagt != positiv and wahr == positiv:
            fn += 1
            fehler.append((text, wahr, vorhergesagt))
        else:
            tn += 1
    genauigkeit = (tp + tn) / len(daten)
    praezision = tp / (tp + fp) if tp + fp else 0.0
    sensitivitaet = tp / (tp + fn) if tp + fn else 0.0
    f1 = 2 * praezision * sensitivitaet / (praezision + sensitivitaet) if praezision + sensitivitaet else 0.0
    return dict(tp=tp, fp=fp, fn=fn, tn=tn, genauigkeit=genauigkeit, praezision=praezision,
                sensitivitaet=sensitivitaet, f1=f1, fehler=fehler)


def drucke(titel: str, m: dict) -> None:
    print(f"== {titel}")
    print(f"   Konfusionsmatrix (Ziel: negative Bewertungen finden)")
    print(f"                        vorhergesagt negativ   vorhergesagt positiv")
    print(f"   tatsächlich negativ        TP = {m['tp']:2}               FN = {m['fn']:2}")
    print(f"   tatsächlich positiv        FP = {m['fp']:2}               TN = {m['tn']:2}")
    print(f"   Genauigkeit (Accuracy):  {m['genauigkeit']:.2f}")
    print(f"   Präzision (Precision):   {m['praezision']:.2f}")
    print(f"   Sensitivität (Recall):   {m['sensitivitaet']:.2f}")
    print(f"   F1-Wert:                 {m['f1']:.2f}")
    for text, wahr, vorhergesagt in m["fehler"]:
        print(f"   Fehler: '{text}' – wahr: {wahr}, vorhergesagt: {vorhergesagt}")


if __name__ == "__main__":
    modell = NaiveBayes().trainieren(TRAINING)
    print(f"Trainiert mit {len(TRAINING)} Bewertungen, Vokabular: {len(modell.vokabular)} Wörter\n")
    drucke(f"Trainingsdaten ({len(TRAINING)} Bewertungen)", metriken(modell, TRAINING))
    print()
    drucke(f"Testdaten ({len(TEST)} Bewertungen, beim Training nie gesehen)", metriken(modell, TEST))
