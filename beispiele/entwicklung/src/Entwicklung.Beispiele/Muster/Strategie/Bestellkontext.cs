namespace Entwicklung.Beispiele.Muster.Strategie;

public sealed record Bestellkontext(decimal Zwischensumme, bool Stammkunde, string? Gutscheincode = null);
