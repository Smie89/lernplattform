# Mini-Shop (Java) – Testanwendung der Lernplattform

Java-Gegenstück zum [.NET-Mini-Shop](../shop/README.md): gleiche Fachlogik, gleiche REST-API,
gleiche Oberfläche – umgesetzt mit **Spring Boot** und getestet mit **JUnit 5, AssertJ, Mockito,
REST Assured und Selenium**. Erklärt in der Lektion **„Tests strukturieren“**:
https://smie89.github.io/lernplattform/lernen/testautomation/grundlagen/tests-strukturieren#java

## Fachliche Regeln

- Ab 100 € Zwischensumme gibt es 10 % Rabatt, Stammkunden erhalten zusätzlich 5 %.
- Pro Produkt sind 1 bis 99 Stück erlaubt.
- Der Demo-Zahlungsdienst lehnt Beträge über 500 € ab.

## Aufbau

Ein Maven-Projekt. Unit-Tests und Integrationstests werden über die **Namenskonvention** getrennt:

```text
pom.xml
src/main/java/de/shop/
├── katalog/ warenkoerbe/ preise/ bestellungen/ zahlung/   Fachlogik
└── api/ShopController.java                                REST-API
src/main/resources/static/                                 Oberfläche (index.html, app.js)

src/test/java/de/shop/
├── preise/RabattrechnerTest.java          ┐
├── warenkoerbe/WarenkorbTest.java         │ Unit-Tests (*Test)  → Surefire, mvn test
├── bestellungen/BestellServiceTest.java   │ gleiche Pakete wie der Produktivcode
├── testdaten/                             ┘ TestProdukte, WarenkorbBuilder
├── apitests/                              ┐
│   ├── infrastruktur/                     │ API-Tests (*IT) mit REST Assured
│   └── produkte/ warenkoerbe/ bestellungen/ ┘                → Failsafe, mvn verify
└── uitests/                               ┐
    ├── infrastruktur/ seiten/ komponenten/ │ UI-Tests (*IT) mit Selenium + Page Object
    └── warenkorb/ bestellungen/           ┘
```

## Voraussetzungen

- JDK 21
- Google Chrome (für die UI-Tests; den passenden Treiber lädt der Selenium Manager automatisch)
- Maven ist **nicht** nötig: Der Maven Wrapper (`mvnw`) lädt beim ersten Aufruf die passende Version.

## Ausführen

```powershell
./mvnw spring-boot:run        # Shop öffnen: http://localhost:8080
./mvnw test                   # nur Unit-Tests (schnell)
./mvnw verify                 # alle Tests: Unit + API + UI
./mvnw verify -Dtest=Rabatt* -Dit.test=Bestellung*   # Auswahl
```

UI-Tests sichtbar im Browser ausführen: `$env:HEADLESS = "false"`. Gegen eine laufende
Umgebung testen: `$env:SHOP_URL = "http://localhost:8080"`.

## Übungsideen

1. Schreibe einen API-Test für `DELETE /api/warenkoerbe/{id}/positionen/{produktId}`.
2. Ergänze in `ShopSeite` eine Methode für die Stammkunden-Checkbox ohne Bestellung und prüfe den angezeigten Rabatt.
3. Baue absichtlich einen Fehler in `Rabattrechner` ein (`> 0` statt `>= 0`). Welche Tests werden rot?
