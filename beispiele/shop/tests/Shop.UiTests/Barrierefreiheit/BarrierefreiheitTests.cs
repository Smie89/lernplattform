using Deque.AxeCore.Commons;
using Deque.AxeCore.Playwright;
using Shop.UiTests.Infrastruktur;

namespace Shop.UiTests.Barrierefreiheit;

/// <summary>
/// Automatische Prüfung auf Barrierefreiheit mit axe-core (WCAG 2.1, Stufen A und AA).
/// Geprüft wird jeder relevante Zustand der Seite – nicht nur der Start, denn Inhalte wie
/// Warenkorbtabelle und Fehlermeldung entstehen erst durch Bedienung.
/// </summary>
public class BarrierefreiheitTests : ShopUiTest
{
    private static readonly AxeRunOptions WcagAundAA = new()
    {
        RunOnly = new RunOnlyOptions { Type = "tag", Values = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    };

    [Test]
    public async Task Startseite_hat_keine_Verstoesse()
    {
        var ergebnis = await Page.RunAxe(WcagAundAA);

        Assert.That(ergebnis.Violations, Is.Empty, Beschreibe(ergebnis.Violations));
    }

    [Test]
    public async Task Gefuellter_Warenkorb_hat_keine_Verstoesse()
    {
        await Shop.InDenWarenkorbAsync("buch", 2);

        var ergebnis = await Page.RunAxe(WcagAundAA);

        Assert.That(ergebnis.Violations, Is.Empty, Beschreibe(ergebnis.Violations));
    }

    [Test]
    public async Task Fehlermeldung_hat_keine_Verstoesse()
    {
        await Shop.InDenWarenkorbAsync("buch");
        await Shop.BestellenAsync(name: "");   // Fehler: Name fehlt
        await Microsoft.Playwright.Assertions.Expect(Shop.Fehlermeldung).ToBeVisibleAsync();

        var ergebnis = await Page.RunAxe(WcagAundAA);

        Assert.That(ergebnis.Violations, Is.Empty, Beschreibe(ergebnis.Violations));
    }

    /// <summary>Lesbare Fehlermeldung: Regel, Auswirkung, betroffene Elemente und Link zur Erklärung.</summary>
    private static string Beschreibe(IEnumerable<AxeResultItem> verstoesse) =>
        string.Join(Environment.NewLine, verstoesse.Select(v =>
            $"[{v.Impact}] {v.Id}: {v.Help} ({v.HelpUrl}){Environment.NewLine}" +
            string.Join(Environment.NewLine, v.Nodes.Select(n => $"    {string.Join(" ", n.Target)}"))));
}
