---
title: Überblick Testautomation
sidebar_label: Überblick
---

# Überblick Testautomation

Empfohlene Reihenfolge:

**Grundlagen**
1. [Grundlagen der Testautomation](./01-grundlagen/01-grundlagen-testautomation.mdx) – Testpyramide, was automatisieren, AAA-Muster, FIRST
2. [Flaky Tests](./01-grundlagen/02-flaky-tests.mdx) – Ursachen finden und beseitigen, Retries und Quarantäne
3. [Tests strukturieren](./01-grundlagen/03-tests-strukturieren.mdx) – Projekte, Ordner, Dateien und Hilfsklassen – mit **lauffähiger Testanwendung**
4. [Mutationstests](./01-grundlagen/04-mutationstests.mdx) – Wie gut sind die Tests wirklich? Stryker.NET und mutmut mit echten Befunden

**C# / .NET**

5. [NUnit – Grundlagen](./02-csharp/01-nunit-grundlagen.mdx) – Attribute, `Assert.That`, parametrisierte Tests, Setup/Teardown
6. [Testdoubles mit NSubstitute](./02-csharp/02-testdoubles-nsubstitute.mdx) – Stub, Mock, Fake; Abhängigkeiten ersetzen

**Java**

7. [JUnit 5 – Grundlagen](./03-java/01-junit5-grundlagen.mdx) – Maven, Assertions, AssertJ, `@ParameterizedTest`, Tags
8. [API-Tests mit REST Assured](./03-java/02-rest-assured.mdx) – REST-APIs testen, JSON prüfen, Schema-Validierung (mit C#-Gegenstück)

**Browser**

9. [Playwright – Grundlagen](./04-browser/01-playwright-grundlagen.mdx) – Locators, Auto-Waiting, Web-First Assertions (C#)
10. [Selenium WebDriver](./04-browser/02-selenium-webdriver.mdx) – C# und Java, Locator-Strategien, explizites Warten
11. [Page Object Model](./04-browser/03-page-object-model.mdx) – wartbare Browser-Tests mit Page Objects und Komponenten

**Desktop (WPF)**

12. [FlaUI – Grundlagen](./05-desktop/01-flaui-grundlagen.mdx) – UI Automation, Elemente finden und bedienen, warten, Dialoge
13. [WPF testbar machen](./05-desktop/02-wpf-testbar-machen.mdx) – MVVM-Teststrategie, AutomationIds in XAML, Screen Objects, CI

**Performance und Last**

14. [Performance- und Lasttests – Grundlagen](./06-performance/01-performance-grundlagen.mdx) – Testarten, Metriken, Perzentile, Lastprofile, Engpässe
15. [Lasttests mit k6](./06-performance/02-lasttests-mit-k6.mdx) – Einkaufsablauf gegen den Mini-Shop, Checks, Schwellen, CI

**Barrierefreiheit**

16. [Barrierefreiheit – Grundlagen](./07-barrierefreiheit/01-barrierefreiheit-grundlagen.mdx) – BFSG, WCAG, Screenreader, semantisches HTML
17. [Barrierefreiheit testen](./07-barrierefreiheit/02-barrierefreiheit-testen.mdx) – axe-core mit Playwright, manuelle Prüfungen, Strategie

**API-Testing vertieft**

18. [OpenAPI und Vertragstests](./08-api-vertieft/01-openapi-vertragstests.mdx) – Beschreibung erzeugen, Vertrag testen, ein echter Befund im Mini-Shop
19. [Externe Dienste simulieren mit WireMock](./08-api-vertieft/02-externe-dienste-wiremock.mdx) – Zahlungsanbieter mit Fehlern, Zeitüberschreitung und Ausfall
20. [Contract-Tests, Authentifizierung und GraphQL](./08-api-vertieft/03-contract-auth-graphql.mdx) – Pact, OAuth 2.0 und JWT, Idempotenz, GraphQL

**Python mit pytest**

21. [Python für Tester](./09-python/01-python-fuer-tester.mdx) – Python kompakt für C#- und Java-Kenner, venv und pip, Decimal, erster Test mit pytest
22. [pytest vertieft](./09-python/02-pytest-vertieft.mdx) – Fixtures, Parametrisierung, Marker, Mock und Fake, Hypothesis, Berichte
23. [API- und Browser-Tests mit Python](./09-python/03-api-und-browser-tests.mdx) – requests, JSON-Schema, pytest-playwright gegen den Mini-Shop

**Mobile Apps mit Appium**

24. [Mobile Apps testen – Grundlagen](./10-mobile/01-mobile-testen-grundlagen.mdx) – App-Arten, Lebenszyklus und Drehen, Emulator oder Gerät, mobile Testpyramide
25. [Appium mit Python](./10-mobile/02-appium.mdx) – Architektur, Capabilities, Locators, Screen Object, zwei echte Befunde
26. [Mobile Tests in der CI](./10-mobile/03-mobile-in-der-ci.mdx) – Android-Emulator in GitHub Actions, Diagnose, iOS und Gerätefarmen

Die C#-, Java-, Python- und Desktop-Module kannst du auch in beliebiger Reihenfolge oder nur eines davon bearbeiten.

Querverbindungen: Selenium Grid, Playwright im Container und Testcontainers im Bereich 🐳 [Docker](../05-docker/05-docker-testautomation.mdx), Tests gegen einen Cluster im Bereich ☸️ [Kubernetes](../12-kubernetes/00-ueberblick.md).

Zertifizierung: Die Theorie hinter Architektur, Einführung, Berichten und Verbesserung von Testautomation – passend zur
Prüfung ISTQB Test Automation Engineering – steht im Bereich 🎓 [ISTQB-Zertifizierung](../11-istqb/00-ueberblick.md),
mit Prüfungssimulation.
