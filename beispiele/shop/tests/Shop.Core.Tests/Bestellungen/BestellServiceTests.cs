using Microsoft.Extensions.Time.Testing;
using NSubstitute;
using Shop.Core.Bestellungen;
using Shop.Core.Preise;
using Shop.Core.Tests.TestDaten;
using Shop.Core.Zahlung;
using static Shop.Core.Tests.TestDaten.WarenkorbBuilder;

namespace Shop.Core.Tests.Bestellungen;

public class BestellServiceTests
{
    private static readonly Kunde Max = new("Max", IstStammkunde: false);
    private static readonly Kunde Stammkundin = new("Anna", IstStammkunde: true);

    private IZahlungsdienst _zahlung = null!;
    private IBestellRepository _repository = null!;
    private FakeTimeProvider _zeit = null!;
    private BestellService _service = null!;

    [SetUp]
    public void Vorbereiten()
    {
        // Jeder Test bekommt frische Testdoubles – kein Zustand zwischen Tests.
        _zahlung = Substitute.For<IZahlungsdienst>();
        _zahlung.Abbuchen(Arg.Any<string>(), Arg.Any<decimal>()).Returns(true);
        _repository = Substitute.For<IBestellRepository>();
        _zeit = new FakeTimeProvider(new DateTimeOffset(2026, 3, 15, 10, 0, 0, TimeSpan.Zero));
        _service = new BestellService(new Rabattrechner(), _zahlung, _repository, _zeit);
    }

    [Test]
    public void Bestellen_mit_genehmigter_Zahlung_speichert_Bestellung()
    {
        var warenkorb = EinWarenkorb().Mit(TestProdukte.Buch).Bauen();

        var ergebnis = _service.Bestellen(warenkorb, Max);

        Assert.That(ergebnis.Erfolgreich, Is.True);
        _repository.Received(1).Speichern(ergebnis.Bestellung!);
    }

    [Test]
    public void Bestellen_bucht_den_rabattierten_Endpreis_ab()
    {
        var warenkorb = EinWarenkorb().MitWert(200m).Bauen();   // 200 € - 15 % = 170 €

        _service.Bestellen(warenkorb, Stammkundin);

        _zahlung.Received(1).Abbuchen("Anna", 170m);
    }

    [Test]
    public void Bestellen_bei_abgelehnter_Zahlung_speichert_nichts()
    {
        _zahlung.Abbuchen(Arg.Any<string>(), Arg.Any<decimal>()).Returns(false);
        var warenkorb = EinWarenkorb().Mit(TestProdukte.Monitor).Bauen();

        var ergebnis = _service.Bestellen(warenkorb, Max);

        Assert.That(ergebnis.Erfolgreich, Is.False);
        Assert.That(ergebnis.Fehler, Does.Contain("abgelehnt"));
        _repository.DidNotReceiveWithAnyArgs().Speichern(default!);
    }

    [Test]
    public void Bestellen_mit_leerem_Warenkorb_wirft_Exception()
    {
        var leer = EinWarenkorb().Bauen();

        Assert.Throws<InvalidOperationException>(() => _service.Bestellen(leer, Max));
        _zahlung.DidNotReceiveWithAnyArgs().Abbuchen(default!, default);
    }

    [Test]
    public void Bestellnummer_enthaelt_das_Bestelldatum()
    {
        var warenkorb = EinWarenkorb().Mit(TestProdukte.Tasse).Bauen();

        var ergebnis = _service.Bestellen(warenkorb, Max);

        Assert.That(ergebnis.Bestellung!.Bestellnummer, Does.StartWith("B-20260315-"));
    }
}
