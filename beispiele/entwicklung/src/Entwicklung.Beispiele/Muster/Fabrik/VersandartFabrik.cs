using Entwicklung.Beispiele.Oop;

namespace Entwicklung.Beispiele.Muster.Fabrik;

/// <summary>Fabrik: Erzeugt das passende Objekt aus einem Code – der Aufrufer kennt die Klassen nicht.</summary>
public static class VersandartFabrik
{
    public static Versandart Erzeuge(string code) => code.ToLowerInvariant() switch
    {
        "standard" => new Standardversand(),
        "express" => new Expressversand(),
        "abholung" => new Abholung(),
        _ => throw new ArgumentException($"Unbekannte Versandart '{code}'.", nameof(code)),
    };
}
