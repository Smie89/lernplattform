namespace Entwicklung.Beispiele.Refactoring;

// VORHER: funktioniert, ist aber schwer zu lesen und zu ändern.
// Gerüche: langer Code in einer Methode, Magic Numbers, kryptische Namen, doppelter Code.
public static class RechnungVorher
{
    public static string Erstelle(List<(string, int, decimal)> p, bool sk)
    {
        var s = "";
        decimal z = 0;
        foreach (var x in p)
        {
            s += x.Item1 + " x" + x.Item2 + ": " + (x.Item3 * x.Item2).ToString("0.00") + " €\n";
            z += x.Item3 * x.Item2;
        }
        decimal r = 0;
        if (z >= 100) r = 0.1m;
        if (sk) r = r + 0.05m;
        var e = Math.Round(z - z * r, 2, MidpointRounding.AwayFromZero);
        s += "Zwischensumme: " + z.ToString("0.00") + " €\n";
        if (r > 0) s += "Rabatt: " + (r * 100).ToString("0") + " %\n";
        s += "Gesamt: " + e.ToString("0.00") + " €\n";
        return s;
    }
}
