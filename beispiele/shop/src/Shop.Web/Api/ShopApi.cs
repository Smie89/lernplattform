using Shop.Core.Bestellungen;
using Shop.Core.Katalog;
using Shop.Core.Preise;
using Shop.Core.Warenkoerbe;

namespace Shop.Web.Api;

public static class ShopApi
{
    public static void MapShopApi(this WebApplication app)
    {
        // Mit Results.Ok(...) kennt OpenAPI den Antworttyp nicht – ohne die Produces-Angaben stünde jeder
        // Endpunkt als "200 ohne Inhalt" in /openapi/v1.json (gefunden durch OpenApiVertragsTests).
        var api = app.MapGroup("/api");

        api.MapGet("/produkte", (IProduktKatalog katalog) => katalog.Alle());

        api.MapPost("/warenkoerbe", (IWarenkorbSpeicher speicher, Rabattrechner rabatt) =>
        {
            var warenkorb = speicher.Neu();
            return Results.Created($"/api/warenkoerbe/{warenkorb.Id}", WarenkorbAntwort.Von(warenkorb, rabatt, false));
        })
        .Produces<WarenkorbAntwort>(StatusCodes.Status201Created);

        api.MapGet("/warenkoerbe/{id:guid}", (Guid id, bool? stammkunde, IWarenkorbSpeicher speicher, Rabattrechner rabatt) =>
            speicher.Finde(id) is { } warenkorb
                ? Results.Ok(WarenkorbAntwort.Von(warenkorb, rabatt, stammkunde ?? false))
                : NichtGefunden("Warenkorb"))
            .Produces<WarenkorbAntwort>()
            .ProducesProblem(StatusCodes.Status404NotFound);

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
            })
            .Produces<WarenkorbAntwort>()
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound);

        api.MapDelete("/warenkoerbe/{id:guid}/positionen/{produktId}",
            (Guid id, string produktId, IWarenkorbSpeicher speicher, Rabattrechner rabatt) =>
            {
                if (speicher.Finde(id) is not { } warenkorb) return NichtGefunden("Warenkorb");
                warenkorb.Entfernen(produktId);
                return Results.Ok(WarenkorbAntwort.Von(warenkorb, rabatt, false));
            })
            .Produces<WarenkorbAntwort>()
            .ProducesProblem(StatusCodes.Status404NotFound);

        api.MapPost("/warenkoerbe/{id:guid}/bestellung",
            (Guid id, BestellAnfrage anfrage, IWarenkorbSpeicher speicher, BestellService service) =>
            {
                if (speicher.Finde(id) is not { } warenkorb) return NichtGefunden("Warenkorb");

                BestellErgebnis ergebnis;
                // SHOP-1: Prüfen, bestellen und entfernen muss pro Warenkorb atomar sein.
                // Sonst kommen gleichzeitige Requests (Doppelklick) alle durch und erzeugen mehrere Bestellungen.
                lock (warenkorb)
                {
                    if (speicher.Finde(id) is null) return NichtGefunden("Warenkorb");   // schon bestellt
                    if (warenkorb.IstLeer) return Results.Problem("Der Warenkorb ist leer.", statusCode: 400);
                    if (string.IsNullOrWhiteSpace(anfrage.KundenName))
                        return Results.Problem("Bitte einen Namen angeben.", statusCode: 400);

                    ergebnis = service.Bestellen(warenkorb, new Kunde(anfrage.KundenName.Trim(), anfrage.Stammkunde));
                    if (ergebnis.Erfolgreich) speicher.Entfernen(id);
                }

                if (!ergebnis.Erfolgreich) return Results.Problem(ergebnis.Fehler, statusCode: 422);
                var b = ergebnis.Bestellung!;
                return Results.Created($"/api/bestellungen/{b.Bestellnummer}",
                    new BestellAntwort(b.Bestellnummer, b.Kunde.Name, b.Zwischensumme, b.Endpreis));
            })
            .Produces<BestellAntwort>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status422UnprocessableEntity);

        api.MapGet("/bestellungen/{nummer}", (string nummer, IBestellRepository repository) =>
            repository.Finde(nummer) is { } b
                ? Results.Ok(new BestellAntwort(b.Bestellnummer, b.Kunde.Name, b.Zwischensumme, b.Endpreis))
                : NichtGefunden("Bestellung"))
            .Produces<BestellAntwort>()
            .ProducesProblem(StatusCodes.Status404NotFound);
    }

    private static IResult NichtGefunden(string was) => Results.Problem($"{was} nicht gefunden.", statusCode: 404);
}
