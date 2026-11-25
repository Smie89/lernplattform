using Shop.Core.Katalog;

namespace Shop.Core.Warenkoerbe;

public sealed record Position(Produkt Produkt, int Menge)
{
    public decimal Summe => Produkt.Preis * Menge;
}
