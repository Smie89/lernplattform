using Shop.Core.Preise;
using Shop.Core.Warenkoerbe;

namespace Shop.Web.Api;

// Anfragen und Antworten der REST-API (werden als camelCase-JSON übertragen).

public sealed record PositionAnfrage(string ProduktId, int Menge);

public sealed record BestellAnfrage(string KundenName, bool Stammkunde);

public sealed record PositionAntwort(string ProduktId, string Name, int Menge, decimal Summe);

public sealed record WarenkorbAntwort(
    Guid Id,
    IReadOnlyList<PositionAntwort> Positionen,
    decimal Zwischensumme,
    decimal RabattSatz,
    decimal Endpreis)
{
    public static WarenkorbAntwort Von(Warenkorb warenkorb, Rabattrechner rabatt, bool stammkunde) => new(
        warenkorb.Id,
        warenkorb.Positionen.Select(p => new PositionAntwort(p.Produkt.Id, p.Produkt.Name, p.Menge, p.Summe)).ToList(),
        warenkorb.Zwischensumme,
        rabatt.RabattSatz(warenkorb.Zwischensumme, stammkunde),
        rabatt.Endpreis(warenkorb.Zwischensumme, stammkunde));
}

public sealed record BestellAntwort(string Bestellnummer, string KundenName, decimal Zwischensumme, decimal Endpreis);
