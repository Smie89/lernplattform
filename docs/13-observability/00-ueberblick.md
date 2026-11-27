---
title: Überblick Observability
sidebar_label: Überblick
---

# Überblick Observability

Tests zeigen, ob eine Anwendung **vor** der Auslieferung funktioniert. **Observability** zeigt, was sie **danach**
tatsächlich tut – mit echten Nutzern, echter Last und echten Fehlern. Für Tester ist das doppelt wichtig:

- Telemetrie ist eine **Anforderung**, die man testen muss – fehlt sie, ist der Betrieb blind.
- Telemetrie ist ein **Werkzeug** zum Testen – sie zeigt, warum ein Test fehlschlägt, wo die Zeit bei einem Lasttest
  bleibt und was in Produktion wirklich passiert.

Das Beispielprojekt [beispiele/observability](https://github.com/Smie89/lernplattform/tree/main/beispiele/observability)
instrumentiert den Mini-Shop mit OpenTelemetry und startet in der CI einen kompletten Stack aus Jaeger, Prometheus und
Grafana. Tests prüfen, dass Traces, Metriken und Logs ankommen – und dass **keine Kundennamen** darin stehen. Dabei
fanden sie einen echten Versionskonflikt zwischen Jaeger und Grafana.

Empfohlene Reihenfolge:

1. [Observability – Grundlagen](./01-observability-grundlagen.mdx) – Logs, Metriken, Traces, RED und Golden Signals, SLI und SLO
2. [OpenTelemetry in der Praxis](./02-opentelemetry.mdx) – den Mini-Shop instrumentieren, Jaeger, Prometheus mit PromQL, Grafana
3. [Observability und Testen](./03-observability-und-testen.mdx) – Telemetrie testen, mit Telemetrie analysieren, Testen in Produktion

Querverbindungen: Log-Analyse im Bereich 🔐 [Erkennung und Incident Response](../07-cybersecurity/06-erkennung-incident-response.mdx),
Lasttests in [Performance](../02-testautomation/06-performance/01-performance-grundlagen.mdx),
Correlation-IDs in der [ISTQB-Lektion zu Berichten](../11-istqb/04-tae-berichte-verifikation.mdx#correlation-id).
