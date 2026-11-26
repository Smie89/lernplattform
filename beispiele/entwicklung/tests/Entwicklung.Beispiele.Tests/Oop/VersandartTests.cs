using Entwicklung.Beispiele.Oop;

namespace Entwicklung.Beispiele.Tests.Oop;

public class VersandartTests
{
    [Test]
    public void Polymorphie_jede_Versandart_berechnet_ihre_eigenen_Kosten()
    {
        var versandarten = new List<Versandart> { new Standardversand(), new Expressversand(), new Abholung() };

        var beschreibungen = versandarten.Select(v => v.Beschreibung(30m)).ToList();

        Assert.That(beschreibungen, Is.EqualTo(new[] { "Standard: 4,90 €", "Express: 12,90 €", "Abholung: 0,00 €" })
            .Or.EqualTo(new[] { "Standard: 4.90 €", "Express: 12.90 €", "Abholung: 0.00 €" }));
    }

    [TestCase(49.99, 4.90)]
    [TestCase(50.00, 0)]
    public void Standardversand_ist_ab_50_Euro_kostenlos(decimal bestellwert, decimal erwartet)
    {
        Assert.That(new Standardversand().Kosten(bestellwert), Is.EqualTo(erwartet));
    }
}
