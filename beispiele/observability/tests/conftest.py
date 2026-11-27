"""Gemeinsame Hilfen: Adressen des Stacks, Warten auf Zustände, Bestellungen mit bekannter Trace-ID."""
import os
import secrets
import subprocess
import time
from pathlib import Path

import pytest
import requests

SHOP = os.environ.get("SHOP_URL", "http://localhost:8080")
JAEGER = os.environ.get("JAEGER_URL", "http://localhost:16686")
PROMETHEUS = os.environ.get("PROMETHEUS_URL", "http://localhost:9090")
GRAFANA = os.environ.get("GRAFANA_URL", "http://localhost:3001")
COMPOSE_ORDNER = Path(__file__).parents[1]

# Ein Name, der in keiner Telemetrie auftauchen darf (Datenschutz-Test)
KUNDENNAME = "Erika Mustermann"


def warte_bis(pruefung, timeout: float = 60, beschreibung: str = "Bedingung"):
    """Fragt wiederholt ab, bis die Prüfung einen Wert liefert – Telemetrie kommt mit Verzögerung an
    (Spans werden gebündelt gesendet, Prometheus holt alle 5 s ab)."""
    frist = time.time() + timeout
    letzter_fehler = None
    while time.time() < frist:
        try:
            ergebnis = pruefung()
            if ergebnis:
                return ergebnis
        except (requests.RequestException, KeyError, ValueError) as fehler:
            letzter_fehler = fehler
        time.sleep(1)
    raise AssertionError(f"{beschreibung} nach {timeout} s nicht erfüllt (zuletzt: {letzter_fehler})")


def neue_trace_id() -> tuple[str, str]:
    """W3C Trace Context: Wer den Header "traceparent" mitschickt, kennt die Trace-ID vorher."""
    trace_id = secrets.token_hex(16)
    return trace_id, f"00-{trace_id}-{secrets.token_hex(8)}-01"


def bestellen(produkt: str, menge: int) -> tuple[str, int]:
    """Legt einen Warenkorb an, füllt ihn und bestellt – liefert Trace-ID und Statuscode der Bestellung."""
    warenkorb = requests.post(f"{SHOP}/api/warenkoerbe", timeout=5).json()["id"]
    requests.post(f"{SHOP}/api/warenkoerbe/{warenkorb}/positionen",
                  json={"produktId": produkt, "menge": menge}, timeout=5).raise_for_status()
    trace_id, traceparent = neue_trace_id()
    antwort = requests.post(f"{SHOP}/api/warenkoerbe/{warenkorb}/bestellung",
                            json={"kundenName": KUNDENNAME, "stammkunde": False},
                            headers={"traceparent": traceparent}, timeout=5)
    return trace_id, antwort.status_code


@pytest.fixture(scope="session")
def bestellungen() -> dict[str, str]:
    """Erzeugt einmal Verkehr: eine erfolgreiche und eine abgelehnte Bestellung (über dem Zahlungslimit)."""
    warte_bis(lambda: requests.get(f"{SHOP}/api/produkte", timeout=5).ok, beschreibung="Shop erreichbar")
    erfolgreich, status1 = bestellen("tasse", 2)
    abgelehnt, status2 = bestellen("monitor", 2)
    assert (status1, status2) == (201, 422)
    return {"erfolgreich": erfolgreich, "abgelehnt": abgelehnt}


def shop_logs() -> str:
    return subprocess.run(["docker", "compose", "logs", "--no-color", "--no-log-prefix", "shop"],
                          cwd=COMPOSE_ORDNER, capture_output=True, text=True, check=True).stdout
