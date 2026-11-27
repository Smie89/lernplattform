"""Bestellen mit austauschbarem Zahlungsdienst – Grundlage für die Mocking-Beispiele."""
from dataclasses import dataclass
from datetime import datetime, timezone
from decimal import Decimal
from typing import Callable, Protocol

from .rabatt import endpreis
from .warenkorb import Warenkorb


class Zahlungsdienst(Protocol):
    def abbuchen(self, kunde: str, betrag: Decimal) -> bool: ...


@dataclass(frozen=True)
class Bestellung:
    nummer: str
    kunde: str
    endpreis: Decimal


class ZahlungAbgelehnt(Exception):
    pass


def bestellen(
    warenkorb: Warenkorb,
    kunde: str,
    zahlung: Zahlungsdienst,
    stammkunde: bool = False,
    jetzt: Callable[[], datetime] = lambda: datetime.now(timezone.utc),
) -> Bestellung:
    if warenkorb.ist_leer:
        raise ValueError("Ein leerer Warenkorb kann nicht bestellt werden.")
    if not kunde.strip():
        raise ValueError("Der Name des Kunden fehlt.")
    betrag = endpreis(warenkorb.zwischensumme, stammkunde)
    if not zahlung.abbuchen(kunde.strip(), betrag):
        raise ZahlungAbgelehnt("Die Zahlung wurde abgelehnt.")
    return Bestellung(nummer=f"B-{jetzt():%Y%m%d}", kunde=kunde.strip(), endpreis=betrag)
