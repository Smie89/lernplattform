# Observability für den Mini-Shop

Beispielprojekt zum Bereich **📈 Observability** der Lernplattform.

Der Shop (`beispiele/shop`) ist mit OpenTelemetry instrumentiert:

- **Traces** für jede Anfrage, dazu der eigene Span „Bestellung aufgeben“ aus `Shop.Core/Telemetrie`
- **Metriken** unter `/metrics`: Anfragen (Dauer, Statuscodes), Laufzeit, `shop_bestellungen_total`,
  `shop_bestellwert_euro`
- **Logs** als JSON mit Trace-ID

Dieser Ordner startet den Stack dazu und testet ihn.

| Datei / Ordner | Inhalt |
|---|---|
| `docker-compose.yml` | Shop, Jaeger 2.20, Prometheus 3.15, Grafana 13.2 |
| `prometheus/prometheus.yml` | holt `/metrics` des Shops alle 5 s ab |
| `grafana/` | Datenquellen und Dashboard „Mini-Shop – Überblick“ als Code |
| `tests/` | 8 pytest-Tests: Metriken, Prometheus, Traces in Jaeger, Logs, Datenschutz, Grafana |

## Starten

```bash
docker build -t mini-shop:1.0 -f ../kubernetes/Dockerfile ../shop
docker compose up -d
```

- Shop: http://localhost:8080
- Jaeger: http://localhost:16686
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3001 (ohne Anmeldung lesbar, Verwaltung mit admin/admin)

## Testen

```bash
pip install -r requirements.txt
pytest tests -v
docker compose down
```

## Befunde beim Aufbau

- Compose (Bake-Builder) liest kein Dockerfile außerhalb des Build-Kontexts, ohne dass man es erlaubt. Das Image
  wird deshalb vorher gebaut.
- Jaegers Abfrage-API `/api/traces` übersetzt das OpenTelemetry-Attribut `http.response.status_code` zurück in den
  alten Namen `http.status_code`.
- Mit Jaeger 2.22 meldete Grafanas Jaeger-Datenquelle „404“: Ab Jaeger 2.21 fehlt die alte API `/api/services`,
  die das Jaeger-Plugin von Grafana 13.2 noch abfragt. Eine Untersuchung in der CI (2.10 bis 2.21) zeigte die
  Grenze genau; der Stack nutzt deshalb Jaeger 2.20.
