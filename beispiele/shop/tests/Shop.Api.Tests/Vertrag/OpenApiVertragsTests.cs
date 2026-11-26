using System.Text.Json;

namespace Shop.Api.Tests.Vertrag;

/// <summary>
/// Vertragstests gegen die OpenAPI-Beschreibung (/openapi/v1.json): Die veröffentlichte Beschreibung muss alle
/// Endpunkte und die Felder enthalten, auf die sich Clients verlassen. Benennt jemand ein Feld um oder
/// entfernt einen Endpunkt, wird der Test rot – bevor ein Client bricht.
/// </summary>
public class OpenApiVertragsTests
{
    private static JsonElement _dokument;

    [OneTimeSetUp]
    public async Task BeschreibungLaden()
    {
        using var http = ApiUmgebung.Anwendung.CreateClient();
        await using var strom = await http.GetStreamAsync("/openapi/v1.json");
        _dokument = (await JsonDocument.ParseAsync(strom)).RootElement.Clone();
    }

    [TestCase("/api/produkte", "get")]
    [TestCase("/api/warenkoerbe", "post")]
    [TestCase("/api/warenkoerbe/{id}", "get")]
    [TestCase("/api/warenkoerbe/{id}/positionen", "post")]
    [TestCase("/api/warenkoerbe/{id}/positionen/{produktId}", "delete")]
    [TestCase("/api/warenkoerbe/{id}/bestellung", "post")]
    [TestCase("/api/bestellungen/{nummer}", "get")]
    public void Endpunkt_ist_beschrieben(string pfad, string methode)
    {
        var pfade = _dokument.GetProperty("paths");

        Assert.That(pfade.TryGetProperty(pfad, out var eintrag), Is.True, $"Pfad {pfad} fehlt");
        Assert.That(eintrag.TryGetProperty(methode, out _), Is.True, $"{methode.ToUpper()} {pfad} fehlt");
    }

    [Test]
    public void Warenkorb_Antwort_hat_die_vereinbarten_Felder()
    {
        var felder = Felder("WarenkorbAntwort");

        Assert.That(felder, Is.SupersetOf(new[] { "id", "positionen", "zwischensumme", "rabattSatz", "endpreis" }));
    }

    [Test]
    public void Position_Anfrage_hat_die_vereinbarten_Felder()
    {
        Assert.That(Felder("PositionAnfrage"), Is.SupersetOf(new[] { "produktId", "menge" }));
    }

    private static IEnumerable<string> Felder(string schema) =>
        _dokument.GetProperty("components").GetProperty("schemas").GetProperty(schema)
            .GetProperty("properties").EnumerateObject().Select(f => f.Name).ToList();
}
