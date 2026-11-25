using Shop.Core.Katalog;

namespace Shop.Core.Tests.TestDaten;

/// <summary>
/// Feste Produkte für Unit-Tests. Bewusst unabhängig vom Demo-Katalog der Anwendung:
/// Ändert jemand dort einen Preis, sollen die Unit-Tests nicht brechen.
/// </summary>
public static class TestProdukte
{
    public static readonly Produkt Buch = new("buch", "Buch", 25.00m);
    public static readonly Produkt Tasse = new("tasse", "Tasse", 10.00m);
    public static readonly Produkt Monitor = new("monitor", "Monitor", 300.00m);

    /// <summary>Ein Produkt mit beliebigem Preis, z. B. um eine Grenze genau zu treffen.</summary>
    public static Produkt MitPreis(decimal preis) => new($"test-{preis}", $"Testprodukt {preis} €", preis);
}
