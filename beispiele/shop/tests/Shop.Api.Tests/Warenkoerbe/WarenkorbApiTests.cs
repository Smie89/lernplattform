using System.Net;
using System.Net.Http.Json;
using Shop.Api.Tests.Infrastruktur;

namespace Shop.Api.Tests.Warenkoerbe;

public class WarenkorbApiTests : ApiTest
{
    [Test]
    public async Task Neuer_Warenkorb_ist_leer()
    {
        var warenkorb = await Shop.NeuerWarenkorbAsync();

        Assert.That(warenkorb.Positionen, Is.Empty);
        Assert.That(warenkorb.Zwischensumme, Is.Zero);
    }

    [Test]
    public async Task Produkt_hinzufuegen_berechnet_Summen()
    {
        var warenkorb = await Shop.NeuerWarenkorbAsync();

        var antwort = await Shop.HinzufuegenAsync(warenkorb.Id, "kopfhoerer", menge: 2);   // 2 x 79 €

        Assert.That(antwort.StatusCode, Is.EqualTo(HttpStatusCode.OK));
        var inhalt = await antwort.Content.ReadFromJsonAsync<WarenkorbDto>();
        Assert.Multiple(() =>
        {
            Assert.That(inhalt!.Zwischensumme, Is.EqualTo(158m));
            Assert.That(inhalt.RabattSatz, Is.EqualTo(0.10m));
            Assert.That(inhalt.Endpreis, Is.EqualTo(142.20m));
        });
    }

    [Test]
    public async Task Stammkunde_bekommt_zusaetzlich_5_Prozent()
    {
        var warenkorb = await Shop.WarenkorbMitAsync(("kopfhoerer", 2));

        var inhalt = await (await Shop.WarenkorbAbrufenAsync(warenkorb.Id, stammkunde: true))
            .Content.ReadFromJsonAsync<WarenkorbDto>();

        Assert.That(inhalt!.Endpreis, Is.EqualTo(134.30m));   // 158 € - 15 %
    }

    [Test]
    public async Task Unbekanntes_Produkt_liefert_400()
    {
        var warenkorb = await Shop.NeuerWarenkorbAsync();

        var antwort = await Shop.HinzufuegenAsync(warenkorb.Id, "gibt-es-nicht");

        Assert.That(antwort.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
        var problem = await antwort.Content.ReadFromJsonAsync<ProblemDto>();
        Assert.That(problem!.Detail, Does.Contain("gibt-es-nicht"));
    }

    [TestCase(0)]
    [TestCase(100)]
    public async Task Ungueltige_Menge_liefert_400(int menge)
    {
        var warenkorb = await Shop.NeuerWarenkorbAsync();

        var antwort = await Shop.HinzufuegenAsync(warenkorb.Id, "buch", menge);

        Assert.That(antwort.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task Unbekannter_Warenkorb_liefert_404()
    {
        var antwort = await Shop.WarenkorbAbrufenAsync(Guid.NewGuid());

        Assert.That(antwort.StatusCode, Is.EqualTo(HttpStatusCode.NotFound));
    }
}
