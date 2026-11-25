using Microsoft.Playwright;
using static Microsoft.Playwright.Assertions;

namespace Shop.UiTests.Komponenten;

/// <summary>Komponente für den Warenkorb-Bereich der Seite. Alle Locators relativ zum Bereich.</summary>
public sealed class WarenkorbBereich(ILocator bereich)
{
    public ILocator LeerHinweis => bereich.GetByTestId("warenkorb-leer");
    public ILocator Zwischensumme => bereich.GetByTestId("zwischensumme");
    public ILocator Rabatt => bereich.GetByTestId("rabatt");
    public ILocator Endpreis => bereich.GetByTestId("endpreis");

    public ILocator Position(string produktId) => bereich.GetByTestId($"position-{produktId}");

    public async Task<int> MengeVonAsync(string produktId)
    {
        var position = Position(produktId);
        return await position.CountAsync() == 0
            ? 0
            : int.Parse(await position.GetByTestId("menge").InnerTextAsync());
    }

    /// <summary>Technisches Warten (kein fachlicher Assert): bis die Oberfläche die neue Menge zeigt.</summary>
    public Task WarteAufMengeAsync(string produktId, int menge) =>
        Expect(Position(produktId).GetByTestId("menge")).ToHaveTextAsync(menge.ToString());

    public Task EntfernenAsync(string produktName) =>
        bereich.GetByRole(AriaRole.Button, new() { Name = $"{produktName} entfernen" }).ClickAsync();
}
