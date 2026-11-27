"""Tests gegen den laufenden Observability-Stack: Kommt die Telemetrie des Shops dort an, wo der Betrieb sie braucht?"""
import json

import requests

from conftest import GRAFANA, JAEGER, KUNDENNAME, PROMETHEUS, SHOP, shop_logs, warte_bis


# ---------- Metriken ----------

def test_metrik_endpunkt_liefert_anfragen_und_eigene_zaehler(bestellungen):
    text = requests.get(f"{SHOP}/metrics", timeout=5).text
    assert "http_server_request_duration_seconds_bucket" in text
    assert 'shop_bestellungen_total{otel_scope_name="MiniShop",ergebnis="abgelehnt"}' in text
    assert 'shop_bestellungen_total{otel_scope_name="MiniShop",ergebnis="erfolgreich"}' in text


def prometheus(abfrage: str) -> list:
    antwort = requests.get(f"{PROMETHEUS}/api/v1/query", params={"query": abfrage}, timeout=5).json()
    assert antwort["status"] == "success", antwort
    return antwort["data"]["result"]


def test_prometheus_sammelt_die_bestellungen_nach_ergebnis(bestellungen):
    ergebnisse = warte_bis(
        lambda: {r["metric"]["ergebnis"] for r in prometheus("sum by (ergebnis) (shop_bestellungen_total)")} >= {"erfolgreich", "abgelehnt"},
        beschreibung="Bestellungen in Prometheus")
    assert ergebnisse


def test_prometheus_berechnet_die_antwortzeit_p95(bestellungen):
    """rate() braucht mindestens zwei Abrufe – deshalb kann das ein paar Sekunden dauern."""
    abfrage = 'histogram_quantile(0.95, sum by (le) (rate(http_server_request_duration_seconds_bucket{http_route="/api/produkte"}[1m])))'
    requests.get(f"{SHOP}/api/produkte", timeout=5)
    werte = warte_bis(lambda: [float(r["value"][1]) for r in prometheus(abfrage) if r["value"][1] != "NaN"],
                      beschreibung="p95 der Antwortzeit")
    assert 0 < werte[0] < 1, f"p95 = {werte[0]} s"


# ---------- Traces ----------

def jaeger_trace(trace_id: str) -> dict:
    antwort = requests.get(f"{JAEGER}/api/traces/{trace_id}", timeout=5)
    daten = antwort.json().get("data") if antwort.ok else None
    return daten[0] if daten else {}


def span_mit_namen(trace: dict, name: str) -> dict:
    return next(s for s in trace["spans"] if s["operationName"] == name)


def tags(span: dict) -> dict:
    return {t["key"]: t["value"] for t in span["tags"]}


def test_trace_der_bestellung_zeigt_anfrage_und_eigenen_span(bestellungen):
    trace = warte_bis(lambda: jaeger_trace(bestellungen["erfolgreich"]).get("spans") and jaeger_trace(bestellungen["erfolgreich"]),
                      beschreibung="Trace in Jaeger")
    namen = {s["operationName"] for s in trace["spans"]}
    assert "POST /api/warenkoerbe/{id:guid}/bestellung" in namen
    assert "Bestellung aufgeben" in namen

    anfrage = span_mit_namen(trace, "POST /api/warenkoerbe/{id:guid}/bestellung")
    eigener = span_mit_namen(trace, "Bestellung aufgeben")
    eltern = {r["spanID"] for r in eigener["references"] if r["refType"] == "CHILD_OF"}
    assert anfrage["spanID"] in eltern, "eigener Span hängt nicht unter der Anfrage"
    assert tags(eigener)["shop.positionen"] == 1
    assert trace["processes"][eigener["processID"]]["serviceName"] == "mini-shop"


def test_abgelehnte_zahlung_ist_im_trace_als_fehler_markiert(bestellungen):
    trace = warte_bis(lambda: jaeger_trace(bestellungen["abgelehnt"]).get("spans") and jaeger_trace(bestellungen["abgelehnt"]),
                      beschreibung="Trace der abgelehnten Bestellung")
    eigener = tags(span_mit_namen(trace, "Bestellung aufgeben"))
    assert eigener.get("otel.status_code") == "ERROR"
    assert eigener.get("otel.status_description") == "Zahlung abgelehnt"
    anfrage = tags(span_mit_namen(trace, "POST /api/warenkoerbe/{id:guid}/bestellung"))
    # Befund: .NET sendet das aktuelle OpenTelemetry-Attribut "http.response.status_code". Die ältere
    # Abfrage-API von Jaeger (/api/traces) übersetzt es zurück in den alten Namen "http.status_code".
    assert anfrage.get("http.response.status_code", anfrage.get("http.status_code")) == 422


# ---------- Logs ----------

def test_log_der_abgelehnten_zahlung_traegt_die_trace_id(bestellungen):
    """Logs und Traces verbinden: Aus der Trace-ID im Log findet man den ganzen Ablauf in Jaeger – und umgekehrt."""
    eintraege = [json.loads(z) for z in shop_logs().splitlines() if z.startswith("{")]
    treffer = [e for e in eintraege if e.get("Category") == "Shop.Bestellungen"]
    trace_ids = {s.get("TraceId") for e in treffer for s in e.get("Scopes", [])}
    assert bestellungen["abgelehnt"] in trace_ids
    assert all(e["LogLevel"] == "Warning" for e in treffer)


# ---------- Datenschutz ----------

def test_kundenname_steht_in_keiner_telemetrie(bestellungen):
    trace = warte_bis(lambda: jaeger_trace(bestellungen["erfolgreich"]).get("spans") and jaeger_trace(bestellungen["erfolgreich"]),
                      beschreibung="Trace in Jaeger")
    nachname = KUNDENNAME.split()[-1]
    assert nachname not in json.dumps(trace, ensure_ascii=False), "Name im Trace"
    assert nachname not in requests.get(f"{SHOP}/metrics", timeout=5).text, "Name in den Metriken"
    assert nachname not in shop_logs(), "Name in den Logs"


# ---------- Grafana ----------

def test_grafana_hat_datenquellen_und_dashboard(bestellungen):
    warte_bis(lambda: requests.get(f"{GRAFANA}/api/health", timeout=5).json()["database"] == "ok", beschreibung="Grafana bereit")
    anmeldung = ("admin", "admin")   # Standardzugang des Test-Containers
    # Dieser Test fand einen Versionskonflikt: Mit Jaeger 2.22 meldete Grafanas Jaeger-Datenquelle "404",
    # weil Jaeger ab 2.21 die alte API /api/services nicht mehr anbietet (siehe docker-compose.yml).
    for uid in ("prometheus", "jaeger"):
        status = requests.get(f"{GRAFANA}/api/datasources/uid/{uid}/health", auth=anmeldung, timeout=10).json()
        assert status.get("status") == "OK", f"{uid}: {status}"
    # Und Grafana sieht über Jaeger auch den Shop:
    dienste = requests.get(f"{GRAFANA}/api/datasources/proxy/uid/jaeger/api/services", auth=anmeldung, timeout=10)
    assert "mini-shop" in dienste.json()["data"]
    treffer = requests.get(f"{GRAFANA}/api/search", params={"query": "Mini-Shop"}, auth=anmeldung, timeout=5).json()
    assert any(t.get("uid") == "mini-shop" for t in treffer)
