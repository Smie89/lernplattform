using System.Diagnostics;
using Shop.Core.Preise;
using Shop.Core.Telemetrie;
using Shop.Core.Warenkoerbe;
using Shop.Core.Zahlung;

namespace Shop.Core.Bestellungen;

public sealed class BestellService(
    Rabattrechner rabattrechner,
    IZahlungsdienst zahlungsdienst,
    IBestellRepository repository,
    TimeProvider zeit)
{
    public BestellErgebnis Bestellen(Warenkorb warenkorb, Kunde kunde)
    {
        // Stryker disable String : Schutzprüfungen – die API prüft vorher selbst, diese Meldungen erreichen keinen Nutzer
        if (warenkorb.IstLeer)
            throw new InvalidOperationException("Ein leerer Warenkorb kann nicht bestellt werden.");
        if (string.IsNullOrWhiteSpace(kunde.Name))
            throw new ArgumentException("Der Name des Kunden fehlt.", nameof(kunde));
        // Stryker restore String

        // Eigener Span im Trace der Anfrage: zeigt in Jaeger, wie lange das Bestellen selbst dauerte und wie es ausging
        using var aktivitaet = ShopTelemetrie.Quelle.StartActivity("Bestellung aufgeben");
        aktivitaet?.SetTag("shop.positionen", warenkorb.Positionen.Count);
        aktivitaet?.SetTag("shop.stammkunde", kunde.IstStammkunde);   // bewusst KEIN Kundenname (Datenschutz)

        var endpreis = rabattrechner.Endpreis(warenkorb.Zwischensumme, kunde.IstStammkunde);
        aktivitaet?.SetTag("shop.endpreis", (double)endpreis);

        if (!zahlungsdienst.Abbuchen(kunde.Name, endpreis))
        {
            aktivitaet?.SetStatus(ActivityStatusCode.Error, "Zahlung abgelehnt");
            ShopTelemetrie.Bestellungen.Add(1, new KeyValuePair<string, object?>("ergebnis", "abgelehnt"));
            return BestellErgebnis.Abgelehnt("Die Zahlung wurde abgelehnt.");
        }

        var jetzt = zeit.GetUtcNow();
        var bestellung = new Bestellung(
            // Stryker disable once String : äquivalenter Mutant – ToString("") liefert ebenfalls Hex-Ziffern am Anfang
            Bestellnummer: $"B-{jetzt:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}",
            Kunde: kunde,
            Positionen: warenkorb.Positionen.ToList(),
            Zwischensumme: warenkorb.Zwischensumme,
            Endpreis: endpreis,
            Zeitpunkt: jetzt);

        repository.Speichern(bestellung);
        ShopTelemetrie.Bestellungen.Add(1, new KeyValuePair<string, object?>("ergebnis", "erfolgreich"));
        ShopTelemetrie.Bestellwert.Record((double)endpreis);
        return BestellErgebnis.Ok(bestellung);
    }
}
