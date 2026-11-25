using Shop.UiTests.Infrastruktur;
using static Microsoft.Playwright.Assertions;

namespace Shop.UiTests.Bestellungen;

public class BestellungUiTests : ShopUiTest
{
    [Test]
    public async Task Stammkunde_kann_bestellen_und_sieht_Bestaetigung()
    {
        await Shop.InDenWarenkorbAsync("buch");

        await Shop.BestellenAsync("Anna Beispiel", stammkunde: true);

        await Expect(Shop.Bestaetigung).ToContainTextAsync("Vielen Dank, Anna Beispiel!");
        await Expect(Shop.Bestaetigung).ToContainTextAsync("23,66 €");   // 24,90 € - 5 %
        await Expect(Shop.Warenkorb.LeerHinweis).ToBeVisibleAsync();      // neuer, leerer Warenkorb
    }

    [Test]
    public async Task Bestellung_ohne_Namen_zeigt_Fehlermeldung()
    {
        await Shop.InDenWarenkorbAsync("buch");

        await Shop.BestellenAsync("");

        await Expect(Shop.Fehlermeldung).ToHaveTextAsync("Bitte einen Namen angeben.");
        await Expect(Shop.Bestaetigung).Not.ToBeVisibleAsync();
    }
}
