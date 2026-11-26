using System.Net.Http.Json;

namespace Shop.Core.Zahlung;

/// <summary>
/// Zahlungsdienst, der einen externen Zahlungsanbieter per HTTP aufruft:
/// POST /zahlungen mit { kunde, betrag } → { status: "genehmigt" | "abgelehnt" }.
/// Im Mini-Shop ist standardmäßig der DemoZahlungsdienst aktiv; diese Klasse zeigt, wie man eine
/// echte externe Abhängigkeit mit WireMock testet – inklusive Fehlern und Zeitüberschreitung.
/// </summary>
public sealed class HttpZahlungsdienst(HttpClient http) : IZahlungsdienst
{
    public bool Abbuchen(string kundenName, decimal betrag)
    {
        try
        {
            using var antwort = http.Send(new HttpRequestMessage(HttpMethod.Post, "zahlungen")
            {
                Content = JsonContent.Create(new ZahlungsAnfrage(kundenName, betrag)),
            });
            if (!antwort.IsSuccessStatusCode) return false;   // 4xx/5xx: im Zweifel nicht als bezahlt werten

            var ergebnis = antwort.Content.ReadFromJsonAsync<ZahlungsAntwort>().GetAwaiter().GetResult();
            return ergebnis?.Status == "genehmigt";
        }
        catch (Exception fehler) when (fehler is HttpRequestException or TaskCanceledException or System.Text.Json.JsonException)
        {
            return false;   // nicht erreichbar, Zeitüberschreitung oder kaputte Antwort: Fail Secure
        }
    }

    private sealed record ZahlungsAnfrage(string Kunde, decimal Betrag);

    private sealed record ZahlungsAntwort(string? Status);
}
