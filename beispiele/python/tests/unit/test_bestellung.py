"""Bestellen: Zahlungsdienst ersetzen mit Mock, Fake und monkeypatch."""
from datetime import datetime, timezone
from decimal import Decimal
from unittest.mock import Mock

import pytest

from shop import bestellung as bestellmodul
from shop.bestellung import ZahlungAbgelehnt, bestellen


@pytest.fixture
def voller_warenkorb(warenkorb, buch):
    warenkorb.hinzufuegen(buch, 4)   # 99,60 € – knapp unter der Rabattschwelle
    return warenkorb


def test_bestellung_bucht_den_endpreis_ab(voller_warenkorb):
    zahlung = Mock()
    zahlung.abbuchen.return_value = True           # Stub: liefert eine feste Antwort

    ergebnis = bestellen(voller_warenkorb, " Anna ", zahlung, stammkunde=True)

    zahlung.abbuchen.assert_called_once_with("Anna", Decimal("94.62"))   # Mock: Aufruf prüfen
    assert ergebnis.endpreis == Decimal("94.62")
    assert ergebnis.kunde == "Anna"   # Befund aus dem Mutationstest: wurde vorher nicht geprüft


def test_abgelehnte_zahlung(voller_warenkorb):
    zahlung = Mock(**{"abbuchen.return_value": False})
    with pytest.raises(ZahlungAbgelehnt):
        bestellen(voller_warenkorb, "Anna", zahlung)


class FakeZahlung:
    """Fake: eine echte, einfache Implementierung – merkt sich alle Buchungen."""

    def __init__(self, limit: Decimal):
        self.limit = limit
        self.buchungen: list[tuple[str, Decimal]] = []

    def abbuchen(self, kunde, betrag):
        if betrag > self.limit:
            return False
        self.buchungen.append((kunde, betrag))
        return True


def test_fake_zahlungsdienst_mit_limit(voller_warenkorb):
    zahlung = FakeZahlung(limit=Decimal("100"))
    bestellen(voller_warenkorb, "Ben", zahlung)
    assert zahlung.buchungen == [("Ben", Decimal("99.60"))]


def test_bestellnummer_mit_fester_zeit(voller_warenkorb):
    """Zeit als Parameter statt datetime.now() im Code – der Test bestimmt das Datum."""
    fest = datetime(2026, 11, 27, tzinfo=timezone.utc)
    ergebnis = bestellen(voller_warenkorb, "Clara", Mock(**{"abbuchen.return_value": True}), jetzt=lambda: fest)
    assert ergebnis.nummer == "B-20261127"


def test_monkeypatch_ersetzt_eine_funktion_im_modul(voller_warenkorb, monkeypatch):
    """monkeypatch tauscht eine Funktion nur für diesen Test aus und stellt sie danach wieder her."""
    monkeypatch.setattr(bestellmodul, "endpreis", lambda summe, stammkunde: Decimal("1.00"))
    zahlung = Mock(**{"abbuchen.return_value": True})
    assert bestellen(voller_warenkorb, "David", zahlung).endpreis == Decimal("1.00")


@pytest.mark.parametrize("name", ["", "   "])
def test_name_ist_pflicht(voller_warenkorb, name):
    with pytest.raises(ValueError, match="Name"):
        bestellen(voller_warenkorb, name, Mock())


def test_leerer_warenkorb(warenkorb):
    zahlung = Mock()
    with pytest.raises(ValueError, match="leer"):
        bestellen(warenkorb, "Anna", zahlung)
    zahlung.abbuchen.assert_not_called()
