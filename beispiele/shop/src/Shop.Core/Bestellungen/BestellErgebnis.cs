namespace Shop.Core.Bestellungen;

public sealed record BestellErgebnis(bool Erfolgreich, Bestellung? Bestellung, string? Fehler)
{
    public static BestellErgebnis Ok(Bestellung bestellung) => new(true, bestellung, null);
    public static BestellErgebnis Abgelehnt(string fehler) => new(false, null, fehler);
}
