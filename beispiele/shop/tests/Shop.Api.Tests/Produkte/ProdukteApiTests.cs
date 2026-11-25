using Shop.Api.Tests.Infrastruktur;

namespace Shop.Api.Tests.Produkte;

public class ProdukteApiTests : ApiTest
{
    [Test]
    public async Task Produktliste_ist_nicht_leer_und_hat_gueltige_Preise()
    {
        var produkte = await Shop.ProdukteAsync();

        Assert.That(produkte, Is.Not.Empty);
        Assert.That(produkte, Has.All.Matches<ProduktDto>(p => p.Preis > 0 && !string.IsNullOrWhiteSpace(p.Name)));
    }

    [Test]
    public async Task Produkt_Ids_sind_eindeutig()
    {
        var produkte = await Shop.ProdukteAsync();

        Assert.That(produkte.Select(p => p.Id), Is.Unique);
    }
}
