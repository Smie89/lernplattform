"""Gemeinsame Fixtures für alle Tests.

pytest findet diese Datei automatisch – Fixtures hier stehen in allen Testdateien darunter
zur Verfügung, ohne Import.
"""
import os
from decimal import Decimal

import pytest
import requests

from shop.api_client import ShopClient
from shop.warenkorb import Produkt, Warenkorb


# ---------- Testdaten für die Unit-Tests ----------

@pytest.fixture
def buch() -> Produkt:
    return Produkt("buch", "Fachbuch Testautomation", Decimal("24.90"))


@pytest.fixture
def monitor() -> Produkt:
    return Produkt("monitor", "Monitor 27 Zoll", Decimal("349.00"))


@pytest.fixture
def warenkorb() -> Warenkorb:
    """Jeder Test bekommt einen frischen, leeren Warenkorb (Scope "function" ist der Standard)."""
    return Warenkorb()


# ---------- Laufende Anwendung für API- und UI-Tests ----------

@pytest.fixture(scope="session")
def shop_url() -> str:
    """URL des laufenden Shops aus der Umgebungsvariablen SHOP_URL – ohne sie werden die Tests übersprungen."""
    url = os.environ.get("SHOP_URL")
    if not url:
        pytest.skip("SHOP_URL ist nicht gesetzt – Mini-Shop starten und z. B. SHOP_URL=http://localhost:5000 setzen")
    try:
        requests.get(f"{url}/api/produkte", timeout=5).raise_for_status()
    except requests.RequestException as fehler:
        pytest.fail(f"Mini-Shop unter {url} nicht erreichbar: {fehler}")
    return url


@pytest.fixture(scope="session")
def client(shop_url) -> ShopClient:
    """Ein Client für die ganze Testsitzung – Fixtures können andere Fixtures nutzen."""
    return ShopClient(shop_url)


@pytest.fixture
def warenkorb_id(client) -> str:
    """Neuer Warenkorb im laufenden Shop für jeden Test."""
    return client.neuer_warenkorb()
