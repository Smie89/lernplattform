using Microsoft.AspNetCore.Mvc.Testing;

namespace Shop.UiTests;

/// <summary>
/// Startet die Anwendung einmal für alle UI-Tests auf einem echten Port, damit der Browser sie aufrufen kann.
/// Alternativ kann eine bereits laufende Umgebung genutzt werden: Umgebungsvariable SHOP_URL setzen.
/// </summary>
[SetUpFixture]
public class ShopServer
{
    private WebApplicationFactory<Program>? _anwendung;

    public static string BaseUrl { get; private set; } = null!;

    [OneTimeSetUp]
    public void Starten()
    {
        var vorhandeneUmgebung = Environment.GetEnvironmentVariable("SHOP_URL");
        if (!string.IsNullOrEmpty(vorhandeneUmgebung))
        {
            BaseUrl = vorhandeneUmgebung;
            return;
        }

        _anwendung = new WebApplicationFactory<Program>();
        _anwendung.UseKestrel(0);   // 0 = freien Port wählen
        _anwendung.StartServer();
        BaseUrl = _anwendung.ClientOptions.BaseAddress.ToString().TrimEnd('/');
    }

    [OneTimeTearDown]
    public void Beenden() => _anwendung?.Dispose();
}
