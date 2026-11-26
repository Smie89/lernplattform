namespace Entwicklung.Beispiele.Muster.Beobachter;

public sealed record Bestellung(string Nummer, string Kunde, decimal Betrag);

/// <summary>
/// Beobachter (Observer) mit C#-Events: Die Bestellannahme meldet neue Bestellungen,
/// ohne zu wissen, wer darauf reagiert (E-Mail, Lager, Statistik ...).
/// </summary>
public sealed class Bestellannahme
{
    public event EventHandler<Bestellung>? BestellungEingegangen;

    public Bestellung Annehmen(string kunde, decimal betrag)
    {
        var bestellung = new Bestellung($"B-{Guid.NewGuid().ToString("N")[..6].ToUpperInvariant()}", kunde, betrag);
        BestellungEingegangen?.Invoke(this, bestellung);
        return bestellung;
    }
}
