using Shop.UiTests.Infrastruktur;
using static Microsoft.Playwright.Assertions;

namespace Shop.UiTests.Warenkorb;

public class WarenkorbUiTests : ShopUiTest
{
    [Test]
    public async Task Beim_Start_ist_der_Warenkorb_leer()
    {
        await Expect(Shop.Warenkorb.LeerHinweis).ToBeVisibleAsync();
        await Expect(Shop.Warenkorb.Endpreis).ToHaveTextAsync("0,00 €");
    }

    [Test]
    public async Task Ab_100_Euro_wird_der_Rabatt_angezeigt()
    {
        await Shop.InDenWarenkorbAsync("kopfhoerer", anzahl: 2);   // 158 €

        await Expect(Shop.Warenkorb.Zwischensumme).ToHaveTextAsync("158,00 €");
        await Expect(Shop.Warenkorb.Rabatt).ToHaveTextAsync("10 %");
        await Expect(Shop.Warenkorb.Endpreis).ToHaveTextAsync("142,20 €");
    }

    [Test]
    public async Task Entfernte_Position_verschwindet()
    {
        await Shop.InDenWarenkorbAsync("tasse");

        await Shop.Warenkorb.EntfernenAsync("Tasse");

        await Expect(Shop.Warenkorb.Position("tasse")).Not.ToBeAttachedAsync();
        await Expect(Shop.Warenkorb.LeerHinweis).ToBeVisibleAsync();
    }
}
