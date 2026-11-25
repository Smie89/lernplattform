using Shop.Core.Bestellungen;
using Shop.Core.Katalog;
using Shop.Core.Preise;
using Shop.Core.Warenkoerbe;

namespace Shop.Web.Api;

public static class ShopApi
{
    public static void MapShopApi(this WebApplication app)
    {
        var api = app.MapGroup("/api");

        api.MapGet("/produkte", (IProduktKatalog katalog) => katalog.Alle());

        api.MapPost("/warenkoerbe", (IWarenkorbSpeicher speicher, Rabattrechner rabatt) =>
        {
            var warenkorb = speicher.Neu();
            return Results.Created($"/api/warenkoerbe/{warenkorb.Id}", WarenkorbAntwort.Von(warenkorb, rabatt, false));
        });

        api.MapGet("/warenkoerbe/{id:guid}", (Guid id, bool? stammkunde, IWarenkorbSpeicher speicher, Rabattrechner rabatt) =>
            speicher.Finde(id) is { } warenkorb
                ? Results.Ok(WarenkorbAntwort.Von(warenkorb, rabatt, stammkunde ?? false))
                : NichtGefunden("Warenkorb"));

        api.MapPost("/warenkoerbe/{id:guid}/positionen",
            (Guid id, PositionAnfrage anfrage, IWarenkorbSpeicher speicher, IProduktKatalog katalog, Rabattrechner rabatt) =>
            {
                if (speicher.Finde(id) is not { } warenkorb) return NichtGefunden("Warenkorb");
                if (katalog.Finde(anfrage.ProduktId) is not { } produkt)
                    return Results.Problem($"Unbekanntes Produkt '{anfrage.ProduktId}'.", statusCode: 400);

                try
                {
                    warenkorb.Hinzufuegen(produkt, anfrage.Menge);
                }
                catch (ArgumentOutOfRangeException ex)
                {
                    return Results.Problem(ex.Message, statusCode: 400);
                }

                return Results.Ok(WarenkorbAntwort.Von(warenkorb, rabatt, false));
            });

        api.MapDelete("/warenkoerbe/{id:guid}/positionen/{produktId}",
            (Guid id, string produktId, IWarenkorbSpeicher speicher, Rabattrechner rabatt) =>
            {
                if (speicher.Finde(id) is not { } warenkorb) return NichtGefunden("Warenkorb");
                warenkorb.Entfernen(produktId);
                return Results.Ok(WarenkorbAntwort.Von(warenkorb, rabatt, false));
            });

        api.MapPost("/warenkoerbe/{id:guid}/bestellung",
            (Guid id, BestellAnfrage anfrage, IWarenkorbSpeicher speicher, BestellService service) =>
            {
                if (speicher.Finde(id) is not { } warenkorb) return NichtGefunden("Warenkorb");
                if (warenkorb.IstLeer) return Results.Problem("Der Warenkorb ist leer.", statusCode: 400);
                if (string.IsNullOrWhiteSpace(anfrage.KundenName))
                    return Results.Problem("Bitte einen Namen angeben.", statusCode: 400);

                var ergebnis = service.Bestellen(warenkorb, new Kunde(anfrage.KundenName.Trim(), anfrage.Stammkunde));
                if (!ergebnis.Erfolgreich) return Results.Problem(ergebnis.Fehler, statusCode: 422);

                speicher.Entfernen(id);
                var b = ergebnis.Bestellung!;
                return Results.Created($"/api/bestellungen/{b.Bestellnummer}",
                    new BestellAntwort(b.Bestellnummer, b.Kunde.Name, b.Zwischensumme, b.Endpreis));
            });

        api.MapGet("/bestellungen/{nummer}", (string nummer, IBestellRepository repository) =>
            repository.Finde(nummer) is { } b
                ? Results.Ok(new BestellAntwort(b.Bestellnummer, b.Kunde.Name, b.Zwischensumme, b.Endpreis))
                : NichtGefunden("Bestellung"));
    }

    private static IResult NichtGefunden(string was) => Results.Problem($"{was} nicht gefunden.", statusCode: 404);
}
