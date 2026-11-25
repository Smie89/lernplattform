using Shop.Core.Warenkoerbe;

namespace Shop.Core.Bestellungen;

public sealed record Bestellung(
    string Bestellnummer,
    Kunde Kunde,
    IReadOnlyList<Position> Positionen,
    decimal Zwischensumme,
    decimal Endpreis,
    DateTimeOffset Zeitpunkt);
