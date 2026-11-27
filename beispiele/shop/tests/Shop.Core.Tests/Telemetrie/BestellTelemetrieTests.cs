using System.Diagnostics;
using System.Diagnostics.Metrics;
using Microsoft.Extensions.Time.Testing;
using NSubstitute;
using Shop.Core.Bestellungen;
using Shop.Core.Preise;
using Shop.Core.Telemetrie;
using Shop.Core.Tests.TestDaten;
using Shop.Core.Zahlung;
using static Shop.Core.Tests.TestDaten.WarenkorbBuilder;

namespace Shop.Core.Tests.Telemetrie;

/// <summary>
/// Telemetrie ist eine Anforderung wie jede andere: Fehlt der Span oder zählt der Zähler falsch, sieht der Betrieb
/// nichts mehr. Diese Tests lauschen mit ActivityListener und MeterListener – ohne OpenTelemetry, ohne Jaeger.
/// </summary>
[NonParallelizable]   // die Listener sind prozessweit
public class BestellTelemetrieTests
{
    private static readonly Kunde Anna = new("Anna Berg", IstStammkunde: true);

    private readonly List<Activity> _spans = [];
    private readonly List<(string Instrument, double Wert, string? Ergebnis)> _messungen = [];
    private ActivityListener _spanLauscher = null!;
    private MeterListener _messLauscher = null!;
    private IZahlungsdienst _zahlung = null!;
    private BestellService _service = null!;

    [SetUp]
    public void Lauschen()
    {
        _spans.Clear();
        _messungen.Clear();

        _spanLauscher = new ActivityListener
        {
            ShouldListenTo = quelle => quelle.Name == ShopTelemetrie.Name,
            Sample = (ref ActivityCreationOptions<ActivityContext> _) => ActivitySamplingResult.AllDataAndRecorded,
            ActivityStopped = span => _spans.Add(span),
        };
        ActivitySource.AddActivityListener(_spanLauscher);

        _messLauscher = new MeterListener
        {
            InstrumentPublished = (instrument, lauscher) =>
            {
                if (instrument.Meter.Name == ShopTelemetrie.Name) lauscher.EnableMeasurementEvents(instrument);
            },
        };
        _messLauscher.SetMeasurementEventCallback<long>((i, wert, tags, _) => Merken(i, wert, tags));
        _messLauscher.SetMeasurementEventCallback<double>((i, wert, tags, _) => Merken(i, wert, tags));
        _messLauscher.Start();

        _zahlung = Substitute.For<IZahlungsdienst>();
        _zahlung.Abbuchen(Arg.Any<string>(), Arg.Any<decimal>()).Returns(true);
        _service = new BestellService(new Rabattrechner(), _zahlung, Substitute.For<IBestellRepository>(),
            new FakeTimeProvider(new DateTimeOffset(2026, 11, 27, 10, 0, 0, TimeSpan.Zero)));
    }

    private void Merken(Instrument instrument, double wert, ReadOnlySpan<KeyValuePair<string, object?>> tags)
    {
        string? ergebnis = null;
        foreach (var tag in tags)
            if (tag.Key == "ergebnis") ergebnis = tag.Value as string;
        _messungen.Add((instrument.Name, wert, ergebnis));
    }

    [TearDown]
    public void Aufhoeren()
    {
        _spanLauscher.Dispose();
        _messLauscher.Dispose();
    }

    [Test]
    public void Erfolgreiche_Bestellung_erzeugt_einen_Span_mit_Kennzahlen()
    {
        _service.Bestellen(EinWarenkorb().Mit(TestProdukte.Buch, 2).Mit(TestProdukte.Tasse).Bauen(), Anna);

        var span = _spans.Single(s => s.DisplayName == "Bestellung aufgeben");
        Assert.Multiple(() =>
        {
            Assert.That(span.GetTagItem("shop.positionen"), Is.EqualTo(2));
            Assert.That(span.GetTagItem("shop.stammkunde"), Is.EqualTo(true));
            Assert.That(span.GetTagItem("shop.endpreis"), Is.GreaterThan(0d));
            Assert.That(span.Status, Is.EqualTo(ActivityStatusCode.Unset));
        });
    }

    [Test]
    public void Erfolgreiche_Bestellung_zaehlt_und_misst_den_Bestellwert()
    {
        _service.Bestellen(EinWarenkorb().MitWert(200m).Bauen(), Anna);   // 200 € − 15 % = 170 €

        Assert.That(_messungen, Does.Contain(("shop.bestellungen", 1d, "erfolgreich")));
        Assert.That(_messungen, Does.Contain(("shop.bestellwert_euro", 170d, (string?)null)));
    }

    [Test]
    public void Abgelehnte_Zahlung_markiert_den_Span_als_Fehler_und_zaehlt_getrennt()
    {
        _zahlung.Abbuchen(Arg.Any<string>(), Arg.Any<decimal>()).Returns(false);

        _service.Bestellen(EinWarenkorb().Mit(TestProdukte.Monitor).Bauen(), Anna);

        var span = _spans.Single(s => s.DisplayName == "Bestellung aufgeben");
        Assert.That(span.Status, Is.EqualTo(ActivityStatusCode.Error));
        Assert.That(span.StatusDescription, Is.EqualTo("Zahlung abgelehnt"));
        Assert.That(_messungen, Does.Contain(("shop.bestellungen", 1d, "abgelehnt")));
        Assert.That(_messungen.Select(m => m.Instrument), Does.Not.Contain("shop.bestellwert_euro"));
    }

    [Test]
    public void Kundenname_landet_nicht_in_der_Telemetrie()
    {
        _service.Bestellen(EinWarenkorb().Mit(TestProdukte.Buch).Bauen(), Anna);

        var alleWerte = _spans.SelectMany(s => s.TagObjects).Select(t => t.Value?.ToString() ?? "");
        Assert.That(alleWerte, Has.None.Contains("Anna"));
    }
}
