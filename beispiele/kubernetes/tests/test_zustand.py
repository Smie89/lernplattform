"""Befund: Der Mini-Shop speichert Warenkörbe im Arbeitsspeicher seines Pods.

Mit zwei Replikaten hinter einem Service landen Folgeanfragen zufällig beim anderen Pod – der kennt den
Warenkorb nicht und antwortet 404. Lokal mit einer Instanz fällt das nie auf.

Abhilfe auf Dauer: Zustand in einen gemeinsamen Speicher (Datenbank, Redis). Notlösung: Session-Affinität –
der Service "mini-shop-sticky" schickt jede Client-IP immer zum selben Pod.
"""
import json

from conftest import anfrage, statuscodes

ANZAHL = 20


def neuer_warenkorb(service: str) -> str:
    status, koerper = anfrage(f"http://{service}/api/warenkoerbe", methode="POST")
    assert status == 201
    return json.loads(koerper)["id"]


def test_ohne_affinitaet_geht_der_warenkorb_verloren():
    """Dokumentiert den Befund: Ein Teil der Anfragen trifft den anderen Pod (Wahrscheinlichkeit, dass alle
    20 Anfragen zufällig denselben Pod treffen: 2 · 0,5^20 ≈ 0,0002 %)."""
    warenkorb = neuer_warenkorb("mini-shop")
    codes = statuscodes(f"http://mini-shop/api/warenkoerbe/{warenkorb}", ANZAHL)
    assert set(codes) == {200, 404}, codes


def test_mit_session_affinitaet_bleibt_der_warenkorb_erhalten():
    warenkorb = neuer_warenkorb("mini-shop-sticky")
    codes = statuscodes(f"http://mini-shop-sticky/api/warenkoerbe/{warenkorb}", ANZAHL)
    assert codes == [200] * ANZAHL, codes
