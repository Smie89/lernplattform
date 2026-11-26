using System.Diagnostics;
using Shop.Core.Zahlung;
using WireMock.RequestBuilders;
using WireMock.ResponseBuilders;
using WireMock.Server;

namespace Shop.Api.Tests.Zahlung;

/// <summary>
/// Der externe Zahlungsanbieter wird mit WireMock simuliert: ein echter HTTP-Server auf einem freien Port,
/// der genau die Antworten liefert, die der Test braucht – auch Fehler und Zeitüberschreitungen,
/// die man beim echten Anbieter kaum gezielt auslösen kann.
/// </summary>
public class HttpZahlungsdienstTests
{
    private WireMockServer _anbieter = null!;
    private HttpClient _http = null!;
    private HttpZahlungsdienst _dienst = null!;

    [SetUp]
    public void Starten()
    {
        _anbieter = WireMockServer.Start();   // freier Port
        // 127.0.0.1 statt "localhost": Unter Windows versucht der Client sonst zuerst IPv6 (::1), wartet dort
        // rund 2 Sekunden auf die Ablehnung – und überschreitet damit das Zeitlimit von 1 Sekunde.
        _http = new HttpClient
        {
            BaseAddress = new Uri($"http://127.0.0.1:{_anbieter.Port}/"),
            Timeout = TimeSpan.FromSeconds(1),
        };
        _dienst = new HttpZahlungsdienst(_http);
    }

    [TearDown]
    public void Beenden()
    {
        _http.Dispose();
        _anbieter.Dispose();   // stoppt den Server und gibt den Port frei
    }

    private void AnbieterAntwortet(int status, string? body = null, TimeSpan? verzoegerung = null)
    {
        var antwort = Response.Create().WithStatusCode(status);
        if (body is not null) antwort = antwort.WithHeader("Content-Type", "application/json").WithBody(body);
        if (verzoegerung is not null) antwort = antwort.WithDelay(verzoegerung.Value);
        _anbieter.Given(Request.Create().WithPath("/zahlungen").UsingPost()).RespondWith(antwort);
    }

    [Test]
    public void Genehmigte_Zahlung()
    {
        AnbieterAntwortet(200, """{"status":"genehmigt"}""");

        Assert.That(_dienst.Abbuchen("Anna", 112.05m), Is.True);
    }

    [Test]
    public void Sendet_Kunde_und_Betrag_als_JSON()
    {
        AnbieterAntwortet(200, """{"status":"genehmigt"}""");

        _dienst.Abbuchen("Anna", 112.05m);

        var anfrage = _anbieter.LogEntries.Single().RequestMessage!;
        Assert.Multiple(() =>
        {
            Assert.That(anfrage.Method, Is.EqualTo("POST"));
            Assert.That(anfrage.Body ?? "", Does.Contain("\"kunde\":\"Anna\"").And.Contain("\"betrag\":112.05"));
        });
    }

    [Test]
    public void Abgelehnte_Zahlung()
    {
        AnbieterAntwortet(200, """{"status":"abgelehnt"}""");

        Assert.That(_dienst.Abbuchen("Anna", 9999m), Is.False);
    }

    [TestCase(400)]
    [TestCase(500)]
    [TestCase(503)]
    public void Fehler_des_Anbieters_gilt_nicht_als_bezahlt(int status)
    {
        AnbieterAntwortet(status);

        Assert.That(_dienst.Abbuchen("Anna", 50m), Is.False);
    }

    [Test]
    public void Kaputte_Antwort_gilt_nicht_als_bezahlt()
    {
        AnbieterAntwortet(200, "<html>Wartungsarbeiten</html>");

        Assert.That(_dienst.Abbuchen("Anna", 50m), Is.False);
    }

    [Test]
    public void Zeitueberschreitung_gilt_nicht_als_bezahlt_und_haengt_nicht()
    {
        AnbieterAntwortet(200, """{"status":"genehmigt"}""", verzoegerung: TimeSpan.FromSeconds(5));
        var uhr = Stopwatch.StartNew();

        var ergebnis = _dienst.Abbuchen("Anna", 50m);

        Assert.That(ergebnis, Is.False);
        Assert.That(uhr.Elapsed, Is.LessThan(TimeSpan.FromSeconds(3)), "Timeout von 1 s muss greifen");
    }

    [Test]
    public void Anbieter_nicht_erreichbar_gilt_nicht_als_bezahlt()
    {
        _anbieter.Stop();

        Assert.That(_dienst.Abbuchen("Anna", 50m), Is.False);
    }
}
