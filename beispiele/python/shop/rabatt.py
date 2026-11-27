"""Rabattregeln wie im .NET-Shop: ab 100 € 10 %, Stammkunden zusätzlich 5 %.

Geldbeträge immer als Decimal, nie als float – siehe test_float_ist_fuer_geld_ungeeignet.
"""
from decimal import Decimal, ROUND_HALF_UP

RABATTSCHWELLE = Decimal("100")
MENGEN_RABATT = Decimal("0.10")
STAMMKUNDEN_RABATT = Decimal("0.05")


def rabatt_satz(zwischensumme: Decimal, stammkunde: bool = False) -> Decimal:
    if zwischensumme < 0:
        raise ValueError("Die Zwischensumme darf nicht negativ sein.")  # pragma: no mutate – interne Meldung
    satz = MENGEN_RABATT if zwischensumme >= RABATTSCHWELLE else Decimal("0")
    if stammkunde:
        satz += STAMMKUNDEN_RABATT
    return satz


def endpreis(zwischensumme: Decimal, stammkunde: bool = False) -> Decimal:
    preis = zwischensumme * (1 - rabatt_satz(zwischensumme, stammkunde))
    return preis.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
