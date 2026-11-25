using Microsoft.Playwright;
using Microsoft.Playwright.NUnit;
using Shop.UiTests.Seiten;

namespace Shop.UiTests.Infrastruktur;

/// <summary>
/// Basisklasse für alle UI-Tests: Browser-Kontext mit Basis-URL, Shop-Seite ist geöffnet.
/// </summary>
public abstract class ShopUiTest : PageTest
{
    protected ShopSeite Shop { get; private set; } = null!;

    public override BrowserNewContextOptions ContextOptions() => new()
    {
        BaseURL = ShopServer.BaseUrl,
        Locale = "de-DE",
        ViewportSize = new() { Width = 1280, Height = 800 },
    };

    [SetUp]
    public async Task ShopOeffnen()
    {
        Shop = await ShopSeite.OeffnenAsync(Page);
    }
}
