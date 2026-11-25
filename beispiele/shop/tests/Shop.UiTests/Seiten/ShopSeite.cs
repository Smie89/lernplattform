using Microsoft.Playwright;
using Shop.UiTests.Komponenten;

namespace Shop.UiTests.Seiten;

/// <summary>Page Object für die einzige Seite des Mini-Shops.</summary>
public sealed class ShopSeite
{
    private readonly IPage _page;

    private ShopSeite(IPage page)
    {
        _page = page;
        Warenkorb = new WarenkorbBereich(page.GetByRole(AriaRole.Region, new() { Name = "Warenkorb" }));
    }

    public WarenkorbBereich Warenkorb { get; }

    public ILocator Bestaetigung => _page.GetByRole(AriaRole.Status);
    public ILocator Fehlermeldung => _page.GetByRole(AriaRole.Alert);

    public static async Task<ShopSeite> OeffnenAsync(IPage page)
    {
        await page.GotoAsync("/");
        // Die Seite setzt data-bereit, sobald Produkte und Warenkorb geladen sind.
        await page.Locator("body[data-bereit=true]").WaitForAsync();
        return new ShopSeite(page);
    }

    public async Task InDenWarenkorbAsync(string produktId, int anzahl = 1)
    {
        var knopf = _page.GetByTestId($"produkt-{produktId}").GetByRole(AriaRole.Button, new() { Name = "In den Warenkorb" });
        for (var i = 0; i < anzahl; i++)
        {
            var mengeVorher = await Warenkorb.MengeVonAsync(produktId);
            await knopf.ClickAsync();
            await Warenkorb.WarteAufMengeAsync(produktId, mengeVorher + 1);
        }
    }

    public async Task BestellenAsync(string name, bool stammkunde = false)
    {
        await _page.GetByLabel("Name").FillAsync(name);
        await _page.GetByLabel("Stammkunde").SetCheckedAsync(stammkunde);
        await _page.GetByRole(AriaRole.Button, new() { Name = "Bestellen" }).ClickAsync();
    }
}
