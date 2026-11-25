using System.Net;
using System.Net.Http.Json;
using Shop.Api.Tests.Infrastruktur;

namespace Shop.Api.Tests.Bestellungen;

public class BestellungApiTests : ApiTest
{
    [Test]
    public async Task Bestellung_wird_angelegt_und_ist_abrufbar()
    {
        var warenkorb = await Shop.WarenkorbMitAsync(("buch", 1));

        var antwort = await Shop.BestellenAsync(warenkorb.Id, "Max Muster");

        Assert.That(antwort.StatusCode, Is.EqualTo(HttpStatusCode.Created));
        var bestellung = await antwort.Content.ReadFromJsonAsync<BestellungDto>();
        Assert.That(bestellung!.Endpreis, Is.EqualTo(24.90m));

        var abgerufen = await ApiUmgebung.Anwendung.CreateClient()
            .GetFromJsonAsync<BestellungDto>(antwort.Headers.Location);
        Assert.That(abgerufen, Is.EqualTo(bestellung));
    }

    [Test]
    public async Task Nach_der_Bestellung_ist_der_Warenkorb_weg()
    {
        var warenkorb = await Shop.WarenkorbMitAsync(("tasse", 1));
        await Shop.BestellenAsync(warenkorb.Id, "Max Muster");

        var antwort = await Shop.WarenkorbAbrufenAsync(warenkorb.Id);

        Assert.That(antwort.StatusCode, Is.EqualTo(HttpStatusCode.NotFound));
    }

    [Test]
    public async Task Leerer_Warenkorb_kann_nicht_bestellt_werden()
    {
        var warenkorb = await Shop.NeuerWarenkorbAsync();

        var antwort = await Shop.BestellenAsync(warenkorb.Id, "Max Muster");

        Assert.That(antwort.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [TestCase("")]
    [TestCase("   ")]
    public async Task Bestellung_ohne_Namen_wird_abgelehnt(string name)
    {
        var warenkorb = await Shop.WarenkorbMitAsync(("buch", 1));

        var antwort = await Shop.BestellenAsync(warenkorb.Id, name);

        Assert.That(antwort.StatusCode, Is.EqualTo(HttpStatusCode.BadRequest));
    }

    [Test]
    public async Task Zahlung_ueber_dem_Limit_wird_mit_422_abgelehnt()
    {
        var warenkorb = await Shop.WarenkorbMitAsync(("monitor", 2));   // 698 € - 10 % = 628,20 € > 500 €

        var antwort = await Shop.BestellenAsync(warenkorb.Id, "Max Muster");

        Assert.That(antwort.StatusCode, Is.EqualTo(HttpStatusCode.UnprocessableEntity));
    }
}
