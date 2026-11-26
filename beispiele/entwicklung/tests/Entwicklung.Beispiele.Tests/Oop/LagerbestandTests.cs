using Entwicklung.Beispiele.Oop;

namespace Entwicklung.Beispiele.Tests.Oop;

public class LagerbestandTests
{
    [Test]
    public void Einlagern_und_Entnehmen_veraendern_die_Menge()
    {
        var bestand = new Lagerbestand("Buch", anfangsbestand: 5);

        bestand.Einlagern(3);
        bestand.Entnehmen(6);

        Assert.That(bestand.Menge, Is.EqualTo(2));
    }

    [Test]
    public void Mehr_entnehmen_als_vorhanden_ist_nicht_moeglich()
    {
        var bestand = new Lagerbestand("Buch", anfangsbestand: 2);

        var ex = Assert.Throws<InvalidOperationException>(() => bestand.Entnehmen(3));

        Assert.That(ex.Message, Does.Contain("Nur 2 Stück"));
        Assert.That(bestand.Menge, Is.EqualTo(2));   // Zustand bleibt gültig
    }

    [TestCase(0)]
    [TestCase(-1)]
    public void Nicht_positive_Anzahl_wird_abgelehnt(int anzahl)
    {
        var bestand = new Lagerbestand("Buch", 10);

        Assert.Throws<ArgumentOutOfRangeException>(() => bestand.Einlagern(anzahl));
    }
}
