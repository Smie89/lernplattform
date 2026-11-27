"""API-Tests gegen den laufenden Mini-Shop (.NET) mit requests und JSON-Schema."""
from decimal import Decimal

import jsonschema
import pytest

from shop.api_client import als_decimal
from shop.rabatt import endpreis

pytestmark = pytest.mark.api   # gilt für alle Tests dieser Datei

PRODUKT_SCHEMA = {
    "type": "array",
    "minItems": 1,
    "items": {
        "type": "object",
        "required": ["id", "name", "preis"],
        "properties": {
            "id": {"type": "string", "pattern": "^[a-z]+$"},
            "name": {"type": "string", "minLength": 1},
            "preis": {"type": "number", "exclusiveMinimum": 0},
        },
    },
}


def test_produktliste_entspricht_dem_schema(client):
    antwort = client.produkte()
    assert antwort.status_code == 200
    assert antwort.headers["Content-Type"].startswith("application/json")
    jsonschema.validate(antwort.json(), PRODUKT_SCHEMA)


def test_sicherheits_header_sind_gesetzt(client):
    header = client.produkte().headers
    assert header["X-Content-Type-Options"] == "nosniff"
    assert "Server" not in header


@pytest.mark.parametrize(
    ("produkt", "menge", "stammkunde"),
    [("tasse", 2, False), ("monitor", 1, True), ("buch", 4, True)],
)
def test_api_rechnet_wie_die_python_logik(client, warenkorb_id, produkt, menge, stammkunde):
    """Zweites Orakel: Die Python-Fassung der Rabattregeln muss dasselbe ergeben wie der Shop."""
    assert client.hinzufuegen(warenkorb_id, produkt, menge).status_code == 200
    daten = client.warenkorb(warenkorb_id, stammkunde).json()
    zwischensumme = als_decimal(daten["zwischensumme"])
    assert als_decimal(daten["endpreis"]) == endpreis(zwischensumme, stammkunde)


@pytest.mark.parametrize(("menge", "status"), [(0, 400), (1, 200), (99, 200), (100, 400)])
def test_grenzen_der_menge(client, warenkorb_id, menge, status):
    assert client.hinzufuegen(warenkorb_id, "tasse", menge).status_code == status


def test_unbekanntes_produkt(client, warenkorb_id):
    antwort = client.hinzufuegen(warenkorb_id, "gibtsnicht")
    assert antwort.status_code == 400
    assert "gibtsnicht" in antwort.json()["detail"]


def test_unbekannter_warenkorb(client):
    assert client.warenkorb("00000000-0000-0000-0000-000000000000").status_code == 404


def test_bestellung_von_anfang_bis_ende(client, warenkorb_id):
    client.hinzufuegen(warenkorb_id, "kopfhoerer")
    client.hinzufuegen(warenkorb_id, "tasse", 2)

    antwort = client.bestellen(warenkorb_id, "Anna Berg", stammkunde=True)

    assert antwort.status_code == 201
    bestellung = antwort.json()
    assert bestellung["bestellnummer"].startswith("B-")
    assert als_decimal(bestellung["endpreis"]) == Decimal("88.40")   # 104,00 € − 15 %
    assert client.warenkorb(warenkorb_id).status_code == 404       # nach der Bestellung weg


def test_zahlung_ueber_dem_limit_wird_abgelehnt(client, warenkorb_id):
    client.hinzufuegen(warenkorb_id, "monitor", 2)   # 698 € → 628,20 € über dem Demo-Limit von 500 €
    antwort = client.bestellen(warenkorb_id, "Ben Kraus")
    assert antwort.status_code == 422
