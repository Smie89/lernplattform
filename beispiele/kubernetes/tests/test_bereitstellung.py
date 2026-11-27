"""Rauchtests nach dem Deployment: läuft alles so, wie es die Manifeste beschreiben?"""
import json
import time

from conftest import anfrage, kubectl, kubectl_json

SHOP = "http://mini-shop"   # Service-Name genügt innerhalb des Namespace (DNS)


def test_alle_replikate_sind_bereit():
    deployment = kubectl_json("get", "deployment", "mini-shop")
    assert deployment["status"].get("readyReplicas") == deployment["spec"]["replicas"] == 2


def test_service_liefert_die_produktliste():
    status, koerper = anfrage(f"{SHOP}/api/produkte")
    assert status == 200
    assert len(json.loads(koerper)) == 5


def test_service_verteilt_auf_beide_pods():
    endpunkte = kubectl_json("get", "endpointslices", "-l", "kubernetes.io/service-name=mini-shop")
    adressen = [a for slice_ in endpunkte["items"] for e in slice_["endpoints"] if e["conditions"]["ready"] for a in e["addresses"]]
    assert len(adressen) == 2


def test_container_laeuft_nicht_als_root():
    assert kubectl("exec", "deploy/mini-shop", "--", "id", "-u").strip() == "10001"


def test_dateisystem_ist_schreibgeschuetzt_ausser_tmp():
    ergebnis = kubectl("exec", "deploy/mini-shop", "--", "sh", "-c",
                       "touch /app/test.txt 2>/dev/null && echo schreibbar || echo schreibgeschuetzt")
    assert ergebnis.strip() == "schreibgeschuetzt"
    assert kubectl("exec", "deploy/mini-shop", "--", "sh", "-c", "touch /tmp/test.txt && echo ok").strip() == "ok"


def test_konfiguration_kommt_aus_der_configmap():
    umgebung = kubectl("exec", "deploy/mini-shop", "--", "printenv", "ASPNETCORE_ENVIRONMENT")
    assert umgebung.strip() == "Production"


def test_selbstheilung_nach_ausfall_eines_pods():
    """Ein Pod wird gelöscht: Der Service antwortet weiter, und das Deployment startet einen Ersatz."""
    vorher = {p["metadata"]["name"] for p in kubectl_json("get", "pods", "-l", "app=mini-shop")["items"]}
    opfer = sorted(vorher)[0]
    kubectl("delete", "pod", opfer, "--wait=false")

    for _ in range(5):   # während des Ausfalls: der zweite Pod übernimmt
        assert anfrage(f"{SHOP}/api/produkte")[0] == 200

    frist = time.time() + 120
    while time.time() < frist:
        pods = kubectl_json("get", "pods", "-l", "app=mini-shop")["items"]
        bereit = {
            p["metadata"]["name"]
            for p in pods
            if p["metadata"].get("deletionTimestamp") is None
            and any(c["type"] == "Ready" and c["status"] == "True" for c in p["status"].get("conditions", []))
        }
        if len(bereit) == 2 and opfer not in bereit:
            return
        time.sleep(2)
    raise AssertionError(f"Nach 120 s keine 2 bereiten Pods ohne {opfer}: {bereit}")
