using System.Globalization;
using System.Text;

namespace Entwicklung.Beispiele.Refactoring;

public sealed record Rechnungsposition(string Artikel, int Menge, decimal Einzelpreis)
{
    public decimal Summe => Einzelpreis * Menge;
}

// NACHHER: gleiches Verhalten (abgesichert durch Tests), aber lesbar und änderbar.
public static class RechnungNachher
{
    private const decimal Rabattschwelle = 100m;
    private const decimal MengenRabatt = 0.10m;
    private const decimal StammkundenRabatt = 0.05m;

    public static string Erstelle(IReadOnlyList<Rechnungsposition> positionen, bool stammkunde)
    {
        var zwischensumme = positionen.Sum(p => p.Summe);
        var rabattSatz = RabattSatz(zwischensumme, stammkunde);
        var gesamt = Math.Round(zwischensumme * (1 - rabattSatz), 2, MidpointRounding.AwayFromZero);

        var text = new StringBuilder();
        foreach (var position in positionen)
            text.Append($"{position.Artikel} x{position.Menge}: {Euro(position.Summe)}\n");

        text.Append($"Zwischensumme: {Euro(zwischensumme)}\n");
        if (rabattSatz > 0)
            text.Append($"Rabatt: {(rabattSatz * 100).ToString("0", CultureInfo.InvariantCulture)} %\n");
        text.Append($"Gesamt: {Euro(gesamt)}\n");
        return text.ToString();
    }

    private static decimal RabattSatz(decimal zwischensumme, bool stammkunde)
    {
        var satz = zwischensumme >= Rabattschwelle ? MengenRabatt : 0m;
        return stammkunde ? satz + StammkundenRabatt : satz;
    }

    private static string Euro(decimal betrag) => $"{betrag.ToString("0.00", CultureInfo.InvariantCulture)} €";
}
