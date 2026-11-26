namespace Entwicklung.Beispiele.Sprachvergleich;

// Gegenstück zu beispiele/entwicklung-java/Sprachvergleich.java – gleiche Aufgaben, C#-Sprachmittel.

public sealed record Position(string Artikel, string Kategorie, int Menge, decimal Einzelpreis)
{
    public decimal Summe => Menge * Einzelpreis;
}

public abstract record Zahlungsart;
public sealed record Kreditkarte(string Endziffern) : Zahlungsart;
public sealed record Rechnung(int ZahlungszielTage) : Zahlungsart;
public sealed record Gutschein(decimal Wert) : Zahlungsart;

public static class Bestellauswertung
{
    // LINQ: filtern, sortieren, projizieren
    public static List<string> TeureArtikel(IEnumerable<Position> positionen, decimal abSumme) =>
        positionen
            .Where(p => p.Summe >= abSumme)
            .OrderByDescending(p => p.Summe)
            .Select(p => p.Artikel)
            .ToList();

    // LINQ: gruppieren und summieren
    public static Dictionary<string, decimal> UmsatzJeKategorie(IEnumerable<Position> positionen) =>
        positionen
            .GroupBy(p => p.Kategorie)
            .ToDictionary(g => g.Key, g => g.Sum(p => p.Summe));

    // Null-Behandlung: ?. und ??
    public static string Anzeigename(string? vorname, string? nachname) =>
        (vorname?.Trim(), nachname?.Trim()) switch
        {
            ({ Length: > 0 } v, { Length: > 0 } n) => $"{v} {n}",
            (_, { Length: > 0 } n) => n,
            _ => "Gast",
        };

    // Switch-Ausdruck mit Musterabgleich auf Typen
    public static string Beschreibung(Zahlungsart zahlungsart) => zahlungsart switch
    {
        Kreditkarte k => $"Kreditkarte **** {k.Endziffern}",
        Rechnung { ZahlungszielTage: > 30 } r => $"Rechnung, {r.ZahlungszielTage} Tage (Freigabe nötig)",
        Rechnung r => $"Rechnung, {r.ZahlungszielTage} Tage",
        Gutschein g => $"Gutschein über {g.Wert:0.00} €",
        _ => throw new ArgumentOutOfRangeException(nameof(zahlungsart)),
    };
}
