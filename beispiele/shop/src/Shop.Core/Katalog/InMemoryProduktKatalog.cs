namespace Shop.Core.Katalog;

/// <summary>Fester Demo-Katalog. In einer echten Anwendung käme er aus einer Datenbank.</summary>
public sealed class InMemoryProduktKatalog : IProduktKatalog
{
    // Stryker disable String : Demo-Daten, keine Logik
    private static readonly Produkt[] Produkte =
    [
        new("buch", "Fachbuch Testautomation", 24.90m),
        new("tasse", "Tasse", 12.50m),
        new("kopfhoerer", "Kopfhörer", 79.00m),
        new("rucksack", "Rucksack", 49.90m),
        new("monitor", "Monitor 27 Zoll", 349.00m),
    ];
    // Stryker restore String

    public IReadOnlyList<Produkt> Alle() => Produkte;

    public Produkt? Finde(string id) => Produkte.FirstOrDefault(p => p.Id == id);
}
