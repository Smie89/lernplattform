using Shop.Core.Zahlung;

namespace Shop.Core.Tests.Zahlung;

/// <summary>
/// Befund aus dem Mutationstest: Stryker ersetzte "betrag &lt;= Limit" durch "betrag &lt; Limit", und kein Test merkte es.
/// Genau 500 € prüfte niemand – ein klassischer fehlender Grenzwert.
/// </summary>
public class DemoZahlungsdienstTests
{
    [TestCase(499.99, true)]
    [TestCase(500.00, true)]    // genau auf der Grenze: wird noch genehmigt
    [TestCase(500.01, false)]
    public void Genehmigt_Betraege_bis_einschliesslich_Limit(decimal betrag, bool genehmigt)
    {
        Assert.That(new DemoZahlungsdienst().Abbuchen("Anna", betrag), Is.EqualTo(genehmigt));
    }
}
