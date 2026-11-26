# Mini-Shop – Testanwendung der Lernplattform

Kleine Webanwendung mit Fachlogik, REST-API und Oberfläche – dazu drei Testprojekte,
die zeigen, wie man Tests in einem echten .NET-Projekt strukturiert.
Erklärt in der Lektion **„Tests strukturieren“**:
https://smie89.github.io/lernplattform/lernen/testautomation/grundlagen/tests-strukturieren

Dieselbe Anwendung gibt es auch in Java: [../shop-java](../shop-java/README.md).

## Fachliche Regeln

- Ab 100 € Zwischensumme gibt es 10 % Rabatt, Stammkunden erhalten zusätzlich 5 %.
- Pro Produkt sind 1 bis 99 Stück erlaubt.
- Der Demo-Zahlungsdienst lehnt Beträge über 500 € ab (so lässt sich der Fehlerfall testen).

## Aufbau

```text
Shop.slnx
├── src/
│   ├── Shop.Core/            Fachlogik (Warenkorb, Rabattrechner, BestellService)
│   └── Shop.Web/             REST-API (Api/ShopApi.cs) und Oberfläche (wwwroot/)
└── tests/
    ├── Shop.Core.Tests/      Unit-Tests: NUnit + NSubstitute, Test Data Builder
    ├── Shop.Api.Tests/       API-Tests: Anwendung im Speicher (WebApplicationFactory)
    └── Shop.UiTests/         UI-Tests: Playwright, Page Object + Komponente
```

## Voraussetzungen

- .NET 10 SDK
- Für die UI-Tests einmalig den Browser installieren (nach dem ersten Build):

```powershell
dotnet build
pwsh tests/Shop.UiTests/bin/Debug/net10.0/playwright.ps1 install chromium
```

(Ohne PowerShell 7: `powershell -ExecutionPolicy Bypass -File ...` statt `pwsh`.)

## Ausführen

```powershell
dotnet run --project src/Shop.Web          # Shop öffnen: http://localhost:5000
dotnet test                                # alle Tests
dotnet test tests/Shop.Core.Tests          # nur Unit-Tests
dotnet test --filter "FullyQualifiedName~Rabatt"
```

Die UI-Tests starten die Anwendung selbst auf einem freien Port. Gegen eine bereits laufende
Instanz testen: Umgebungsvariable `SHOP_URL` setzen, z. B. `$env:SHOP_URL = "http://localhost:5000"`.

## Übungsideen

1. Neue Regel: Ab 3 Stück desselben Produkts gibt es das günstigste gratis. Wo schreibst du welchen Test?
2. Schreibe einen API-Test für `DELETE /api/warenkoerbe/{id}/positionen/{produktId}`.
3. Ergänze im Page Object eine Methode für „Menge erhöhen“ und einen UI-Test dazu.
4. Baue absichtlich einen Fehler in `Rabattrechner` ein (`>` statt `>=`). Welche Tests werden rot – und warum nur diese?
