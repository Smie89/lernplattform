using System.Net.Http.Json;

namespace Shop.Api.Tests.Infrastruktur;

/// <summary>
/// Fachliche Methoden für die Shop-API – das Gegenstück zum Page Object bei API-Tests.
/// Die Tests kennen dadurch keine URLs und kein JSON-Format.
/// </summary>
public sealed class ShopApiClient(HttpClient http)
{
    public async Task<List<ProduktDto>> ProdukteAsync() =>
        (await http.GetFromJsonAsync<List<ProduktDto>>("/api/produkte"))!;

    public async Task<WarenkorbDto> NeuerWarenkorbAsync()
    {
        var antwort = await http.PostAsync("/api/warenkoerbe", content: null);
        antwort.EnsureSuccessStatusCode();
        return (await antwort.Content.ReadFromJsonAsync<WarenkorbDto>())!;
    }

    public Task<HttpResponseMessage> WarenkorbAbrufenAsync(Guid id, bool stammkunde = false) =>
        http.GetAsync($"/api/warenkoerbe/{id}?stammkunde={stammkunde}");

    public Task<HttpResponseMessage> HinzufuegenAsync(Guid warenkorbId, string produktId, int menge = 1) =>
        http.PostAsJsonAsync($"/api/warenkoerbe/{warenkorbId}/positionen", new { produktId, menge });

    public Task<HttpResponseMessage> BestellenAsync(Guid warenkorbId, string kundenName, bool stammkunde = false) =>
        http.PostAsJsonAsync($"/api/warenkoerbe/{warenkorbId}/bestellung", new { kundenName, stammkunde });

    /// <summary>Abkürzung für Tests, die einen gefüllten Warenkorb nur als Vorbedingung brauchen.</summary>
    public async Task<WarenkorbDto> WarenkorbMitAsync(params (string ProduktId, int Menge)[] positionen)
    {
        var warenkorb = await NeuerWarenkorbAsync();
        foreach (var (produktId, menge) in positionen)
            (await HinzufuegenAsync(warenkorb.Id, produktId, menge)).EnsureSuccessStatusCode();
        return warenkorb;
    }
}
