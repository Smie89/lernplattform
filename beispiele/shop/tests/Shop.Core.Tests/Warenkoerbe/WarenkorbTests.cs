using Shop.Core.Tests.TestDaten;
using Shop.Core.Warenkoerbe;
using static Shop.Core.Tests.TestDaten.WarenkorbBuilder;

namespace Shop.Core.Tests.Warenkoerbe;

public class WarenkorbTests
{
    [Test]
    public void Neuer_Warenkorb_ist_leer()
    {
        var warenkorb = new Warenkorb();

        Assert.Multiple(() =>
        {
            Assert.That(warenkorb.IstLeer, Is.True);
            Assert.That(warenkorb.Zwischensumme, Is.Zero);
        });
    }

    [Test]
    public void Hinzufuegen_berechnet_Zwischensumme()
    {
        var warenkorb = EinWarenkorb()
            .Mit(TestProdukte.Buch, 2)     // 2 x 25 €
            .Mit(TestProdukte.Tasse)       // 1 x 10 €
            .Bauen();

        Assert.That(warenkorb.Zwischensumme, Is.EqualTo(60m));
    }

    [Test]
    public void Gleiches_Produkt_erhoeht_Menge_statt_neuer_Position()
    {
        var warenkorb = EinWarenkorb().Mit(TestProdukte.Buch).Bauen();

        warenkorb.Hinzufuegen(TestProdukte.Buch, 2);

        Assert.That(warenkorb.Positionen, Has.Count.EqualTo(1));
        Assert.That(warenkorb.Positionen[0].Menge, Is.EqualTo(3));
    }

    [TestCase(0)]
    [TestCase(-1)]
    [TestCase(Warenkorb.MaximaleMenge + 1)]
    public void Ungueltige_Menge_wird_abgelehnt(int menge)
    {
        var warenkorb = new Warenkorb();

        var fehler = Assert.Throws<ArgumentOutOfRangeException>(() => warenkorb.Hinzufuegen(TestProdukte.Buch, menge));

        // Die Meldung gibt die API als "detail" an den Nutzer weiter – also prüfen (Befund aus dem Mutationstest).
        Assert.That(fehler.Message, Does.Contain("zwischen 1 und 99"));
    }

    [Test]
    public void Menge_darf_auch_in_Summe_das_Maximum_nicht_ueberschreiten()
    {
        var warenkorb = EinWarenkorb().Mit(TestProdukte.Buch, Warenkorb.MaximaleMenge).Bauen();

        Assert.Throws<ArgumentOutOfRangeException>(() => warenkorb.Hinzufuegen(TestProdukte.Buch));
    }

    [Test]
    public void Entfernen_loescht_die_Position()
    {
        var warenkorb = EinWarenkorb().Mit(TestProdukte.Buch).Mit(TestProdukte.Tasse).Bauen();

        warenkorb.Entfernen(TestProdukte.Buch.Id);

        Assert.That(warenkorb.Positionen.Select(p => p.Produkt), Is.EqualTo(new[] { TestProdukte.Tasse }));
    }
}
