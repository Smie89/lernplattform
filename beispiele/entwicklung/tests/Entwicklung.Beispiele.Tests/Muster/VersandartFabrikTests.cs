using Entwicklung.Beispiele.Muster.Fabrik;
using Entwicklung.Beispiele.Oop;

namespace Entwicklung.Beispiele.Tests.Muster;

public class VersandartFabrikTests
{
    [TestCase("standard", typeof(Standardversand))]
    [TestCase("EXPRESS", typeof(Expressversand))]
    [TestCase("abholung", typeof(Abholung))]
    public void Erzeugt_die_passende_Versandart(string code, Type erwartet)
    {
        Assert.That(VersandartFabrik.Erzeuge(code), Is.TypeOf(erwartet));
    }

    [Test]
    public void Unbekannter_Code_wird_abgelehnt()
    {
        Assert.Throws<ArgumentException>(() => VersandartFabrik.Erzeuge("brieftaube"));
    }
}
