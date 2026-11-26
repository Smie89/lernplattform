using Entwicklung.Beispiele.Muster.Strategie;

namespace Entwicklung.Beispiele.Tests.Muster;

public class PreisrechnerTests
{
    private static Preisrechner StandardRegeln() =>
        new([new MengenRabatt(), new StammkundenRabatt()]);

    [TestCase(99.99, false, 99.99)]
    [TestCase(100, false, 90)]
    [TestCase(50, true, 47.50)]
    [TestCase(100, true, 85)]
    public void Liefert_dieselben_Ergebnisse_wie_der_Rabattrechner_des_Shops(
        decimal zwischensumme, bool stammkunde, decimal erwartet)
    {
        var endpreis = StandardRegeln().Endpreis(new Bestellkontext(zwischensumme, stammkunde));

        Assert.That(endpreis, Is.EqualTo(erwartet));
    }

    [Test]
    public void Neue_Regel_ohne_Aenderung_am_Preisrechner()
    {
        var rechner = new Preisrechner([new MengenRabatt(), new StammkundenRabatt(), new GutscheinRabatt("HERBST", 0.10m)]);

        var endpreis = rechner.Endpreis(new Bestellkontext(100m, Stammkunde: true, Gutscheincode: "herbst"));

        Assert.That(endpreis, Is.EqualTo(75m));   // 10 % + 5 % + 10 % = 25 %
    }

    [Test]
    public void Rabatt_ist_auf_30_Prozent_begrenzt()
    {
        var rechner = new Preisrechner([new MengenRabatt(), new GutscheinRabatt("A", 0.20m), new GutscheinRabatt("A", 0.20m)]);

        Assert.That(rechner.RabattSatz(new Bestellkontext(200m, false, "A")), Is.EqualTo(0.30m));
    }
}
