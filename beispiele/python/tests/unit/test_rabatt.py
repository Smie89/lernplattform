"""Rabattregeln: Grenzwerte mit parametrize, Ausnahmen mit pytest.raises, Eigenschaften mit Hypothesis."""
from decimal import Decimal

import pytest
from hypothesis import given, strategies as st

from shop.rabatt import endpreis, rabatt_satz

D = Decimal


@pytest.mark.parametrize(
    ("zwischensumme", "stammkunde", "erwartet"),
    [
        (D("0"), False, D("0")),
        (D("99.99"), False, D("0")),       # knapp unter der Schwelle
        (D("100.00"), False, D("0.10")),   # genau auf der Schwelle
        (D("100.01"), False, D("0.10")),
        (D("99.99"), True, D("0.05")),
        (D("100.00"), True, D("0.15")),
    ],
    ids=["null", "unter-schwelle", "auf-schwelle", "ueber-schwelle", "stammkunde-unter", "stammkunde-auf"],
)
def test_rabatt_satz_an_den_grenzen(zwischensumme, stammkunde, erwartet):
    assert rabatt_satz(zwischensumme, stammkunde) == erwartet


@pytest.mark.parametrize(
    ("zwischensumme", "stammkunde", "erwartet"),
    [(D("100"), False, D("90.00")), (D("100"), True, D("85.00")), (D("24.90"), True, D("23.66"))],
)
def test_endpreis(zwischensumme, stammkunde, erwartet):
    assert endpreis(zwischensumme, stammkunde) == erwartet


def test_negative_zwischensumme_wird_abgelehnt():
    with pytest.raises(ValueError, match="negativ"):
        rabatt_satz(D("-0.01"))


def test_float_ist_fuer_geld_ungeeignet():
    """Warum der Shop Decimal nutzt: float kann 0,1 nicht exakt darstellen."""
    assert 0.1 + 0.2 != 0.3
    assert D("0.1") + D("0.2") == D("0.3")


betraege = st.decimals(min_value=0, max_value=100_000, places=2)


@given(zwischensumme=betraege, stammkunde=st.booleans())
def test_endpreis_liegt_zwischen_null_und_zwischensumme(zwischensumme, stammkunde):
    """Eigenschaftsbasiert: Hypothesis erzeugt Hunderte Beträge und sucht ein Gegenbeispiel."""
    assert D("0") <= endpreis(zwischensumme, stammkunde) <= zwischensumme


@given(betrag=betraege)
def test_stammkunde_zahlt_nie_mehr(betrag):
    assert endpreis(betrag, stammkunde=True) <= endpreis(betrag, stammkunde=False)
