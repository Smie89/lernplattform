"""Warenkorb: Fixtures, Klassen zur Gruppierung, Ausnahmen."""
from decimal import Decimal

import pytest

from shop.warenkorb import MAXIMALE_MENGE


def test_neuer_warenkorb_ist_leer(warenkorb):
    assert warenkorb.ist_leer
    assert warenkorb.zwischensumme == Decimal("0")


class TestHinzufuegen:
    def test_gleiches_produkt_erhoeht_die_menge(self, warenkorb, buch):
        warenkorb.hinzufuegen(buch)
        warenkorb.hinzufuegen(buch, 2)
        assert len(warenkorb.positionen) == 1
        assert warenkorb.positionen[0].menge == 3

    def test_zwischensumme_ueber_mehrere_produkte(self, warenkorb, buch, monitor):
        warenkorb.hinzufuegen(buch, 2)
        warenkorb.hinzufuegen(monitor)
        assert warenkorb.zwischensumme == Decimal("398.80")

    @pytest.mark.parametrize("menge", [0, -1, MAXIMALE_MENGE + 1])
    def test_ungueltige_menge_wird_abgelehnt(self, warenkorb, buch, menge):
        with pytest.raises(ValueError, match="zwischen 1 und 99"):
            warenkorb.hinzufuegen(buch, menge)
        assert warenkorb.ist_leer   # nichts halb hinzugefügt

    def test_hoechstmenge_gilt_fuer_die_summe_der_mengen(self, warenkorb, buch):
        warenkorb.hinzufuegen(buch, MAXIMALE_MENGE)
        with pytest.raises(ValueError):
            warenkorb.hinzufuegen(buch, 1)


def test_entfernen(warenkorb, buch, monitor):
    warenkorb.hinzufuegen(buch)
    warenkorb.hinzufuegen(monitor)
    warenkorb.entfernen("buch")
    assert [p.produkt.id for p in warenkorb.positionen] == ["monitor"]
