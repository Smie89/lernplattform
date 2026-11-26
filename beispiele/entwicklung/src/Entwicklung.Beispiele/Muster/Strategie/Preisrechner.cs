namespace Entwicklung.Beispiele.Muster.Strategie;

/// <summary>
/// Kennt nur die Schnittstelle IRabattregel, nicht die einzelnen Regeln.
/// Die Regeln werden von außen übergeben (Dependency Injection).
/// </summary>
public sealed class Preisrechner(IEnumerable<IRabattregel> regeln)
{
    public const decimal MaximalerRabatt = 0.30m;

    public decimal RabattSatz(Bestellkontext bestellung) =>
        Math.Min(regeln.Sum(r => r.Satz(bestellung)), MaximalerRabatt);

    public decimal Endpreis(Bestellkontext bestellung) =>
        Math.Round(bestellung.Zwischensumme * (1 - RabattSatz(bestellung)), 2, MidpointRounding.AwayFromZero);
}
