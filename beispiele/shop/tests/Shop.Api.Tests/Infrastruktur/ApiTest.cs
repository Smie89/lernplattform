namespace Shop.Api.Tests.Infrastruktur;

/// <summary>
/// Basisklasse für alle API-Tests: stellt pro Test einen frischen Client bereit.
/// Enthält nur Technik – keine fachlichen Schritte und keine Asserts.
/// </summary>
public abstract class ApiTest
{
    private HttpClient _http = null!;

    protected ShopApiClient Shop { get; private set; } = null!;

    [SetUp]
    public void ClientErstellen()
    {
        _http = ApiUmgebung.Anwendung.CreateClient();
        Shop = new ShopApiClient(_http);
    }

    [TearDown]
    public void ClientFreigeben() => _http.Dispose();
}
