namespace Entwicklung.Beispiele.Oop;

/// <summary>
/// Kapselung: Der Bestand kann von außen nur über Methoden geändert werden,
/// die die Regeln (nie negativ) durchsetzen.
/// </summary>
public class Lagerbestand
{
    public Lagerbestand(string artikel, int anfangsbestand = 0)
    {
        if (string.IsNullOrWhiteSpace(artikel))
            throw new ArgumentException("Artikel fehlt.", nameof(artikel));
        if (anfangsbestand < 0)
            throw new ArgumentOutOfRangeException(nameof(anfangsbestand), "Bestand darf nicht negativ sein.");

        Artikel = artikel;
        Menge = anfangsbestand;
    }

    public string Artikel { get; }

    public int Menge { get; private set; }   // lesen: alle – ändern: nur diese Klasse

    public void Einlagern(int anzahl)
    {
        if (anzahl <= 0) throw new ArgumentOutOfRangeException(nameof(anzahl), "Anzahl muss positiv sein.");
        Menge += anzahl;
    }

    public void Entnehmen(int anzahl)
    {
        if (anzahl <= 0) throw new ArgumentOutOfRangeException(nameof(anzahl), "Anzahl muss positiv sein.");
        if (anzahl > Menge) throw new InvalidOperationException($"Nur {Menge} Stück von {Artikel} auf Lager.");
        Menge -= anzahl;
    }
}
