using Shop.Core.Katalog;

namespace Shop.Core.Warenkoerbe;

public sealed class Warenkorb
{
    public const int MaximaleMenge = 99;

    private readonly List<Position> _positionen = [];

    public Guid Id { get; } = Guid.NewGuid();

    public IReadOnlyList<Position> Positionen => _positionen;

    public bool IstLeer => _positionen.Count == 0;

    public decimal Zwischensumme => _positionen.Sum(p => p.Summe);

    /// <summary>Fügt ein Produkt hinzu. Ist es schon im Warenkorb, wird die Menge erhöht.</summary>
    public void Hinzufuegen(Produkt produkt, int menge = 1)
    {
        var index = _positionen.FindIndex(p => p.Produkt.Id == produkt.Id);
        var neueMenge = (index >= 0 ? _positionen[index].Menge : 0) + menge;

        if (menge < 1 || neueMenge > MaximaleMenge)
            throw new ArgumentOutOfRangeException(nameof(menge), menge,
                $"Die Menge pro Produkt muss zwischen 1 und {MaximaleMenge} liegen.");

        if (index >= 0)
            _positionen[index] = _positionen[index] with { Menge = neueMenge };
        else
            _positionen.Add(new Position(produkt, menge));
    }

    public void Entfernen(string produktId) => _positionen.RemoveAll(p => p.Produkt.Id == produktId);
}
