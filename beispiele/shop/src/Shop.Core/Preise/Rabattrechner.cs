namespace Shop.Core.Preise;

/// <summary>
/// Rabattregeln des Shops:
/// ab 100 € Zwischensumme 10 %, Stammkunden erhalten zusätzlich 5 %.
/// </summary>
public sealed class Rabattrechner
{
    public const decimal Rabattschwelle = 100m;
    public const decimal MengenRabatt = 0.10m;
    public const decimal StammkundenRabatt = 0.05m;

    public decimal RabattSatz(decimal zwischensumme, bool stammkunde)
    {
        if (zwischensumme < 0)
            throw new ArgumentOutOfRangeException(nameof(zwischensumme), "Die Zwischensumme darf nicht negativ sein.");

        var satz = zwischensumme >= Rabattschwelle ? MengenRabatt : 0m;
        if (stammkunde) satz += StammkundenRabatt;
        return satz;
    }

    public decimal Endpreis(decimal zwischensumme, bool stammkunde) =>
        Math.Round(zwischensumme * (1 - RabattSatz(zwischensumme, stammkunde)), 2, MidpointRounding.AwayFromZero);
}
