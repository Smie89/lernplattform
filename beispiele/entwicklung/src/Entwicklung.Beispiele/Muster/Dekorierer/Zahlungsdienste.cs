namespace Entwicklung.Beispiele.Muster.Dekorierer;

public interface IZahlungsdienst
{
    bool Abbuchen(string kunde, decimal betrag);
}

/// <summary>
/// Dekorierer: implementiert dieselbe Schnittstelle, umhüllt einen anderen Zahlungsdienst
/// und ergänzt Verhalten (hier: Protokollierung), ohne dessen Code zu ändern.
/// </summary>
public sealed class ProtokollierenderZahlungsdienst(IZahlungsdienst innerer, Action<string> protokoll)
    : IZahlungsdienst
{
    public bool Abbuchen(string kunde, decimal betrag)
    {
        protokoll($"Abbuchung {betrag:0.00} € für {kunde} ...");
        var ok = innerer.Abbuchen(kunde, betrag);
        protokoll(ok ? "... genehmigt" : "... abgelehnt");
        return ok;
    }
}

/// <summary>Zweiter Dekorierer: wiederholt bei Ablehnung – Dekorierer lassen sich verketten.</summary>
public sealed class WiederholenderZahlungsdienst(IZahlungsdienst innerer, int versuche) : IZahlungsdienst
{
    public bool Abbuchen(string kunde, decimal betrag)
    {
        for (var i = 1; i <= versuche; i++)
        {
            if (innerer.Abbuchen(kunde, betrag)) return true;
        }
        return false;
    }
}
