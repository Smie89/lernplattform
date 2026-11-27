"""Schlanker Client für die REST-API des Mini-Shops.

Die Tests sprechen nur mit diesem Client (Geschäftslogik-Schicht), nie direkt mit requests
(Kernbibliothek) – so ändert man bei API-Änderungen genau eine Stelle.
"""
from decimal import Decimal

import requests


class ShopClient:
    def __init__(self, basis_url: str, timeout: float = 5.0):
        self.basis_url = basis_url.rstrip("/")
        self.timeout = timeout
        self.sitzung = requests.Session()

    def _anfrage(self, methode: str, pfad: str, **kwargs) -> requests.Response:
        return self.sitzung.request(methode, f"{self.basis_url}/api{pfad}", timeout=self.timeout, **kwargs)

    def produkte(self) -> requests.Response:
        return self._anfrage("GET", "/produkte")

    def neuer_warenkorb(self) -> str:
        antwort = self._anfrage("POST", "/warenkoerbe")
        antwort.raise_for_status()
        return antwort.json()["id"]

    def warenkorb(self, warenkorb_id: str, stammkunde: bool = False) -> requests.Response:
        return self._anfrage("GET", f"/warenkoerbe/{warenkorb_id}", params={"stammkunde": str(stammkunde).lower()})

    def hinzufuegen(self, warenkorb_id: str, produkt_id: str, menge: int = 1) -> requests.Response:
        return self._anfrage("POST", f"/warenkoerbe/{warenkorb_id}/positionen",
                             json={"produktId": produkt_id, "menge": menge})

    def bestellen(self, warenkorb_id: str, kunde: str, stammkunde: bool = False) -> requests.Response:
        return self._anfrage("POST", f"/warenkoerbe/{warenkorb_id}/bestellung",
                             json={"kundenName": kunde, "stammkunde": stammkunde})


def als_decimal(wert) -> Decimal:
    """JSON-Zahlen kommen als float an – für Geldvergleiche in Decimal umwandeln."""
    return Decimal(str(wert))
