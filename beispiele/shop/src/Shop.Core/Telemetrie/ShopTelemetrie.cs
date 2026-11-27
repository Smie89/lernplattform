using System.Diagnostics;
using System.Diagnostics.Metrics;

namespace Shop.Core.Telemetrie;

/// <summary>
/// Eigene Traces und Metriken des Shops – mit Bordmitteln von .NET (ActivitySource, Meter), ohne Abhängigkeit zu
/// OpenTelemetry. Shop.Web meldet beides über OpenTelemetry an Jaeger und Prometheus (Lektion "Observability").
///
/// Datenschutz: Kundennamen gehören NICHT in Telemetrie – Traces und Metriken landen in Systemen mit vielen Lesern
/// und langer Aufbewahrung. Erfasst werden nur Beträge, Anzahl und ob jemand Stammkunde ist.
/// </summary>
public static class ShopTelemetrie
{
    public const string Name = "MiniShop";

    public static readonly ActivitySource Quelle = new(Name);

    private static readonly Meter Messgeraet = new(Name);

    /// <summary>Anzahl der Bestellversuche, unterschieden nach Ergebnis (erfolgreich / abgelehnt).</summary>
    public static readonly Counter<long> Bestellungen =
        Messgeraet.CreateCounter<long>("shop.bestellungen", description: "Bestellversuche nach Ergebnis");

    /// <summary>Endpreis erfolgreicher Bestellungen in Euro – als Histogramm für Verteilung und Perzentile.</summary>
    public static readonly Histogram<double> Bestellwert =
        Messgeraet.CreateHistogram<double>("shop.bestellwert_euro", description: "Endpreis erfolgreicher Bestellungen in Euro");
}
