namespace Shop.Api.Tests.Sicherheit;

/// <summary>
/// Sicherheits-Regressionstest für die Befunde des Header-Checks: Jede Antwort – Seite wie API –
/// muss die Schutz-Header mitbringen. Fehlt einer nach einer Änderung, wird der Test rot.
/// </summary>
public class SicherheitsHeaderTests
{
    [TestCase("/")]
    [TestCase("/api/produkte")]
    public async Task Antwort_enthaelt_Sicherheits_Header(string pfad)
    {
        using var http = ApiUmgebung.Anwendung.CreateClient();

        using var antwort = await http.GetAsync(pfad);

        Assert.Multiple(() =>
        {
            Assert.That(Header(antwort, "Content-Security-Policy"), Does.Contain("default-src 'self'").And.Contain("frame-ancestors 'none'"));
            Assert.That(Header(antwort, "X-Content-Type-Options"), Is.EqualTo("nosniff"));
            Assert.That(Header(antwort, "X-Frame-Options"), Is.EqualTo("DENY"));
            Assert.That(Header(antwort, "Referrer-Policy"), Is.EqualTo("no-referrer"));
        });
    }

    private static string? Header(HttpResponseMessage antwort, string name) =>
        antwort.Headers.TryGetValues(name, out var werte) ? string.Join(", ", werte) : null;
}
