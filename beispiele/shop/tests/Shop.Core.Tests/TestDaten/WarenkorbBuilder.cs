using Shop.Core.Katalog;
using Shop.Core.Warenkoerbe;

namespace Shop.Core.Tests.TestDaten;

/// <summary>
/// Test Data Builder: Erzeugt Warenkörbe lesbar in einer Zeile, z. B.
/// <c>EinWarenkorb().Mit(TestProdukte.Buch, 2).Bauen()</c>.
/// </summary>
public sealed class WarenkorbBuilder
{
    private readonly List<(Produkt Produkt, int Menge)> _positionen = [];

    public static WarenkorbBuilder EinWarenkorb() => new();

    public WarenkorbBuilder Mit(Produkt produkt, int menge = 1)
    {
        _positionen.Add((produkt, menge));
        return this;
    }

    /// <summary>Warenkorb mit genau dieser Zwischensumme (ein Testprodukt mit passendem Preis).</summary>
    public WarenkorbBuilder MitWert(decimal zwischensumme) => Mit(TestProdukte.MitPreis(zwischensumme));

    public Warenkorb Bauen()
    {
        var warenkorb = new Warenkorb();
        foreach (var (produkt, menge) in _positionen)
            warenkorb.Hinzufuegen(produkt, menge);
        return warenkorb;
    }
}
