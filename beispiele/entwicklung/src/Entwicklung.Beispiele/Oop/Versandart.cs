namespace Entwicklung.Beispiele.Oop;

/// <summary>Abstrakte Basisklasse: legt fest, WAS jede Versandart kann – nicht WIE.</summary>
public abstract class Versandart
{
    public abstract string Name { get; }

    public abstract decimal Kosten(decimal bestellwert);

    // Gemeinsames Verhalten für alle Unterklassen
    public string Beschreibung(decimal bestellwert) => $"{Name}: {Kosten(bestellwert):0.00} €";
}

public sealed class Standardversand : Versandart
{
    public override string Name => "Standard";

    public override decimal Kosten(decimal bestellwert) => bestellwert >= 50m ? 0m : 4.90m;
}

public sealed class Expressversand : Versandart
{
    public override string Name => "Express";

    public override decimal Kosten(decimal bestellwert) => 12.90m;
}

public sealed class Abholung : Versandart
{
    public override string Name => "Abholung";

    public override decimal Kosten(decimal bestellwert) => 0m;
}
