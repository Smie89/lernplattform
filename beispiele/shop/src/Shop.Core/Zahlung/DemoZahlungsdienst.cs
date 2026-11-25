namespace Shop.Core.Zahlung;

/// <summary>
/// Simulierter Zahlungsdienst für die Demo: genehmigt Beträge bis zum Limit, lehnt höhere ab.
/// So lässt sich auch der Fehlerfall in API- und UI-Tests nachstellen.
/// </summary>
public sealed class DemoZahlungsdienst : IZahlungsdienst
{
    public const decimal Limit = 500m;

    public bool Abbuchen(string kundenName, decimal betrag) => betrag <= Limit;
}
