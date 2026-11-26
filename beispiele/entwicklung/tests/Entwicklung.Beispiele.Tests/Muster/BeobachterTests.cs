using Entwicklung.Beispiele.Muster.Beobachter;

namespace Entwicklung.Beispiele.Tests.Muster;

public class BeobachterTests
{
    [Test]
    public void Alle_angemeldeten_Beobachter_werden_benachrichtigt()
    {
        var annahme = new Bestellannahme();
        var mails = new List<string>();
        var lager = new List<string>();
        annahme.BestellungEingegangen += (_, b) => mails.Add($"Bestätigung an {b.Kunde}");
        annahme.BestellungEingegangen += (_, b) => lager.Add(b.Nummer);

        var bestellung = annahme.Annehmen("Anna", 49.90m);

        Assert.That(mails, Is.EqualTo(new[] { "Bestätigung an Anna" }));
        Assert.That(lager, Is.EqualTo(new[] { bestellung.Nummer }));
    }

    [Test]
    public void Ohne_Beobachter_funktioniert_die_Annahme_trotzdem()
    {
        Assert.DoesNotThrow(() => new Bestellannahme().Annehmen("Anna", 10m));
    }
}
