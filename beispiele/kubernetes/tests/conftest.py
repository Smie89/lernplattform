"""Hilfen für Tests gegen einen laufenden Kubernetes-Cluster (in der CI: kind)."""
import json
import subprocess
from pathlib import Path

import pytest

NAMESPACE = "mini-shop"


def kubectl(*argumente: str, pruefen: bool = True) -> str:
    """Führt kubectl im Namespace des Shops aus und liefert die Ausgabe."""
    ergebnis = subprocess.run(
        ["kubectl", "-n", NAMESPACE, *argumente], capture_output=True, text=True, timeout=120
    )
    if pruefen and ergebnis.returncode != 0:
        raise AssertionError(f"kubectl {' '.join(argumente)} fehlgeschlagen:\n{ergebnis.stderr}")
    return ergebnis.stdout


def kubectl_json(*argumente: str) -> dict:
    return json.loads(kubectl(*argumente, "-o", "json"))


def statuscodes(url: str, anzahl: int, methode: str = "GET") -> list[int]:
    """Ruft eine URL mehrmals vom Testclient-Pod aus auf – jede Anfrage über eine neue Verbindung."""
    skript = f'for i in $(seq {anzahl}); do curl -s -o /dev/null -w "%{{http_code}}\\n" -X {methode} {url}; done'
    ausgabe = kubectl("exec", "testclient", "--", "sh", "-c", skript)
    return [int(zeile) for zeile in ausgabe.split()]


def anfrage(url: str, methode: str = "GET", json_daten: str | None = None) -> tuple[int, str]:
    """Eine einzelne Anfrage vom Testclient aus; liefert Statuscode und Antworttext."""
    befehl = ["curl", "-s", "-w", "\n%{http_code}", "-X", methode, url]
    if json_daten:
        befehl += ["-H", "Content-Type: application/json", "-d", json_daten]
    *koerper, status = kubectl("exec", "testclient", "--", *befehl).rsplit("\n", 1)
    return int(status), "".join(koerper)


@pytest.fixture(autouse=True)
def zwei_bereite_pods():
    """Vor jedem Test: beide Replikate bereit. Sonst hängt ein Test vom vorherigen ab – nach einem fehlgeschlagenen
    Selbstheilungstest lief der Zustandstest mit nur einem Pod und fand den Befund nicht."""
    kubectl("rollout", "status", "deployment/mini-shop", "--timeout=120s")


@pytest.fixture(scope="session", autouse=True)
def testclient():
    """Startet den Hilfs-Pod einmal für alle Tests und räumt ihn danach wieder ab."""
    manifest = Path(__file__).with_name("testclient.yaml")
    kubectl("apply", "-f", str(manifest))
    kubectl("wait", "--for=condition=Ready", "pod/testclient", "--timeout=90s")
    yield
    kubectl("delete", "-f", str(manifest), "--wait=false", pruefen=False)
