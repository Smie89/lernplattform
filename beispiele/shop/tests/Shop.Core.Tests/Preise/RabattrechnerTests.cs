using Shop.Core.Preise;

namespace Shop.Core.Tests.Preise;

public class RabattrechnerTests
{
    private readonly Rabattrechner _rechner = new();   // zustandslos – darf geteilt werden

    [TestCase(0, false, 0)]
    [TestCase(99.99, false, 99.99)]    // knapp unter der Schwelle: kein Rabatt
    [TestCase(100, false, 90)]         // genau auf der Schwelle: 10 %
    [TestCase(250, false, 225)]
    [TestCase(50, true, 47.50)]        // Stammkunde unter der Schwelle: 5 %
    [TestCase(100, true, 85)]          // Stammkunde ab Schwelle: 15 %
    public void Endpreis_wendet_Rabattregeln_an(decimal zwischensumme, bool stammkunde, decimal erwartet)
    {
        var endpreis = _rechner.Endpreis(zwischensumme, stammkunde);

        Assert.That(endpreis, Is.EqualTo(erwartet));
    }

    [Test]
    public void Endpreis_wird_kaufmaennisch_auf_Cent_gerundet()
    {
        // 100,05 € * 0,85 = 85,0425 € -> 85,04 €
        var endpreis = _rechner.Endpreis(100.05m, stammkunde: true);

        Assert.That(endpreis, Is.EqualTo(85.04m));
    }

    [Test]
    public void Negative_Zwischensumme_wird_abgelehnt()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => _rechner.Endpreis(-1m, stammkunde: false));
    }
}
