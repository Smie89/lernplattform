using Entwicklung.Beispiele.Refactoring;

namespace Entwicklung.Beispiele.Tests.Refactoring;

/// <summary>
/// Charakterisierungstests: Sie halten das Verhalten des alten Codes fest.
/// Dieselben Fälle müssen nach dem Refactoring dasselbe Ergebnis liefern.
/// </summary>
public class RechnungTests
{
    private static readonly (string Artikel, int Menge, decimal Preis)[][] Faelle =
    [
        [("Buch", 2, 24.90m)],
        [("Monitor", 1, 349.00m), ("Kabel", 3, 9.99m)],
        [("Tasse", 1, 12.50m)],
        [],
    ];

    private static IEnumerable<TestCaseData> AlleFaelle()
    {
        for (var i = 0; i < Faelle.Length; i++)
        {
            yield return new TestCaseData(i, false).SetName($"Fall {i}, kein Stammkunde");
            yield return new TestCaseData(i, true).SetName($"Fall {i}, Stammkunde");
        }
    }

    [TestCaseSource(nameof(AlleFaelle))]
    public void Nachher_liefert_exakt_dasselbe_wie_vorher(int fall, bool stammkunde)
    {
        var vorher = RechnungVorher.Erstelle(Faelle[fall].Select(p => (p.Artikel, p.Menge, p.Preis)).ToList(), stammkunde);
        var nachher = RechnungNachher.Erstelle(
            Faelle[fall].Select(p => new Rechnungsposition(p.Artikel, p.Menge, p.Preis)).ToList(), stammkunde);

        Assert.That(nachher, Is.EqualTo(vorher.Replace(',', '.')));
    }

    [Test]
    public void Beispielrechnung()
    {
        var text = RechnungNachher.Erstelle(
            [new("Monitor", 1, 349.00m), new("Kabel", 3, 9.99m)], stammkunde: true);

        Assert.That(text, Is.EqualTo(
            "Monitor x1: 349.00 €\n" +
            "Kabel x3: 29.97 €\n" +
            "Zwischensumme: 378.97 €\n" +
            "Rabatt: 15 %\n" +
            "Gesamt: 322.12 €\n"));
    }
}
