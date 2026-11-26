namespace Entwicklung.Beispiele.Muster.Strategie;

/// <summary>Strategie: Jede Rabattregel ist eine austauschbare Klasse mit derselben Schnittstelle.</summary>
public interface IRabattregel
{
    /// <returns>Rabattsatz, z. B. 0.10m für 10 %, oder 0m, wenn die Regel nicht greift.</returns>
    decimal Satz(Bestellkontext bestellung);
}

public sealed class MengenRabatt : IRabattregel
{
    public decimal Satz(Bestellkontext b) => b.Zwischensumme >= 100m ? 0.10m : 0m;
}

public sealed class StammkundenRabatt : IRabattregel
{
    public decimal Satz(Bestellkontext b) => b.Stammkunde ? 0.05m : 0m;
}

/// <summary>Neue Regel – hinzugefügt, ohne den Preisrechner zu ändern (Open/Closed-Prinzip).</summary>
public sealed class GutscheinRabatt(string code, decimal satz) : IRabattregel
{
    public decimal Satz(Bestellkontext b) =>
        string.Equals(b.Gutscheincode, code, StringComparison.OrdinalIgnoreCase) ? satz : 0m;
}
