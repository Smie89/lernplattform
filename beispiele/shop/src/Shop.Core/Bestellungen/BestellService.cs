using Shop.Core.Preise;
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
        if (warenkorb.IstLeer)
            throw new InvalidOperationException("Ein leerer Warenkorb kann nicht bestellt werden.");
        if (string.IsNullOrWhiteSpace(kunde.Name))
            throw new ArgumentException("Der Name des Kunden fehlt.", nameof(kunde));

        var endpreis = rabattrechner.Endpreis(warenkorb.Zwischensumme, kunde.IstStammkunde);

        if (!zahlungsdienst.Abbuchen(kunde.Name, endpreis))
            return BestellErgebnis.Abgelehnt("Die Zahlung wurde abgelehnt.");

        var jetzt = zeit.GetUtcNow();
        var bestellung = new Bestellung(
            Bestellnummer: $"B-{jetzt:yyyyMMdd}-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}",
            Kunde: kunde,
            Positionen: warenkorb.Positionen.ToList(),
            Zwischensumme: warenkorb.Zwischensumme,
            Endpreis: endpreis,
            Zeitpunkt: jetzt);

        repository.Speichern(bestellung);
        return BestellErgebnis.Ok(bestellung);
    }
}
