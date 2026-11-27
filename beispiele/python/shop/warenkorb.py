"""Warenkorb mit Positionen – entspricht Shop.Core/Warenkoerbe im .NET-Shop."""
from dataclasses import dataclass, field
from decimal import Decimal

MAXIMALE_MENGE = 99


@dataclass(frozen=True)
class Produkt:
    id: str
    name: str
    preis: Decimal


@dataclass
class Position:
    produkt: Produkt
    menge: int

    @property
    def summe(self) -> Decimal:
        return self.produkt.preis * self.menge


@dataclass
class Warenkorb:
    positionen: list[Position] = field(default_factory=list)

    @property
    def ist_leer(self) -> bool:
        return not self.positionen

    @property
    def zwischensumme(self) -> Decimal:
        return sum((p.summe for p in self.positionen), Decimal("0"))

    def hinzufuegen(self, produkt: Produkt, menge: int = 1) -> None:
        """Fügt ein Produkt hinzu; ist es schon da, steigt die Menge."""
        vorhanden = next((p for p in self.positionen if p.produkt.id == produkt.id), None)
        neue_menge = (vorhanden.menge if vorhanden else 0) + menge
        if menge < 1 or neue_menge > MAXIMALE_MENGE:
            raise ValueError(f"Die Menge pro Produkt muss zwischen 1 und {MAXIMALE_MENGE} liegen.")
        if vorhanden:
            vorhanden.menge = neue_menge
        else:
            self.positionen.append(Position(produkt, menge))

    def entfernen(self, produkt_id: str) -> None:
        self.positionen = [p for p in self.positionen if p.produkt.id != produkt_id]
