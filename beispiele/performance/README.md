# Performance-Beispiel: Lasttest für den Mini-Shop mit k6

`lasttest.js` spielt den typischen Einkauf durch (Produkte ansehen, Warenkorb, Artikel, Bestellung)
und prüft dabei fachliche Ergebnisse (`check`) und Antwortzeiten (`thresholds`).
Erklärt im Modul **Performance** des Bereichs 🤖 Testautomation:
https://smie89.github.io/lernplattform/lernen/testautomation/performance

## Ausführen

1. k6 installieren: https://grafana.com/docs/k6/latest/set-up/install-k6/
   (Windows: `winget install k6`, macOS: `brew install k6`, oder als Container `grafana/k6`)
2. Mini-Shop starten (`beispiele/shop`): `dotnet run --project src/Shop.Web --urls http://localhost:5000`
3. Test starten:

```bash
cd beispiele/performance
k6 run lasttest.js                  # Rauchtest: 1 Nutzer, 10 Sekunden
k6 run -e PROFIL=last lasttest.js   # Lasttest: Rampe auf 20 Nutzer, 30 s halten
```

In der CI startet `beispiele/linux/tests-mit-app.sh` den Shop, führt den Rauchtest und einen kurzen Lasttest aus
und beendet den Shop wieder. Verletzte Schwellen machen den Job rot.

## Übungsideen

1. Erhöhe im Profil `last` die Nutzerzahl schrittweise (50, 100, 200). Ab wann steigt p95 deutlich?
2. Ergänze einen Schritt „Warenkorb mit Stammkundenrabatt abrufen“ mit eigener Schwelle.
3. Baue einen Spike-Test: in 2 Sekunden von 0 auf 100 Nutzer, dann sofort zurück.
4. Was passiert mit der Fehlerrate, wenn du einen Warenkorb über 500 € bestellst (Zahlungslimit)?
