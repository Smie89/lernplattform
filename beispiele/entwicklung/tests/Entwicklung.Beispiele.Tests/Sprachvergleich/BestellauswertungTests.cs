using System.Globalization;
using Entwicklung.Beispiele.Sprachvergleich;

namespace Entwicklung.Beispiele.Tests.Sprachvergleich;

public class BestellauswertungTests
{
    private static readonly List<Position> Positionen =
    [
        new("Buch", "Medien", 2, 24.90m),
        new("Monitor", "Technik", 1, 349.00m),
        new("Kabel", "Technik", 3, 9.99m),
        new("Tasse", "Haushalt", 1, 12.50m),
    ];

    [Test]
    public void TeureArtikel_filtert_und_sortiert()
    {
        Assert.That(Bestellauswertung.TeureArtikel(Positionen, 25m), Is.EqualTo(new[] { "Monitor", "Buch", "Kabel" }));
    }

    [Test]
    public void UmsatzJeKategorie_gruppiert_und_summiert()
    {
        var umsatz = Bestellauswertung.UmsatzJeKategorie(Positionen);

        Assert.That(umsatz["Technik"], Is.EqualTo(378.97m));
        Assert.That(umsatz["Medien"], Is.EqualTo(49.80m));
        Assert.That(umsatz, Has.Count.EqualTo(3));
    }

    [TestCase("Anna", "Beispiel", "Anna Beispiel")]
    [TestCase(null, "Beispiel", "Beispiel")]
    [TestCase("  ", null, "Gast")]
    [TestCase(null, null, "Gast")]
    public void Anzeigename_behandelt_null_und_Leerzeichen(string? vorname, string? nachname, string erwartet)
    {
        Assert.That(Bestellauswertung.Anzeigename(vorname, nachname), Is.EqualTo(erwartet));
    }

    [Test]
    public void Beschreibung_nutzt_Musterabgleich()
    {
        CultureInfo.CurrentCulture = CultureInfo.GetCultureInfo("de-DE");

        Assert.Multiple(() =>
        {
            Assert.That(Bestellauswertung.Beschreibung(new Kreditkarte("4242")), Is.EqualTo("Kreditkarte **** 4242"));
            Assert.That(Bestellauswertung.Beschreibung(new Rechnung(14)), Is.EqualTo("Rechnung, 14 Tage"));
            Assert.That(Bestellauswertung.Beschreibung(new Rechnung(60)), Is.EqualTo("Rechnung, 60 Tage (Freigabe nötig)"));
            Assert.That(Bestellauswertung.Beschreibung(new Gutschein(25m)), Is.EqualTo("Gutschein über 25,00 €"));
        });
    }
}
