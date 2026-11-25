namespace Shop.Api.Tests.Infrastruktur;

// Eigene Abbildung der JSON-Antworten. Absichtlich NICHT die Klassen aus Shop.Web:
// Benennt dort jemand ein Feld um, sollen die Tests den Vertragsbruch bemerken.

public sealed record ProduktDto(string Id, string Name, decimal Preis);

public sealed record PositionDto(string ProduktId, string Name, int Menge, decimal Summe);

public sealed record WarenkorbDto(Guid Id, List<PositionDto> Positionen, decimal Zwischensumme, decimal RabattSatz, decimal Endpreis);

public sealed record BestellungDto(string Bestellnummer, string KundenName, decimal Zwischensumme, decimal Endpreis);

public sealed record ProblemDto(int Status, string? Detail);
