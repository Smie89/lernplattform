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

**C# / .NET**

4. [NUnit – Grundlagen](./02-csharp/01-nunit-grundlagen.mdx) – Attribute, `Assert.That`, parametrisierte Tests, Setup/Teardown
5. [Testdoubles mit NSubstitute](./02-csharp/02-testdoubles-nsubstitute.mdx) – Stub, Mock, Fake; Abhängigkeiten ersetzen

**Java**

6. [JUnit 5 – Grundlagen](./03-java/01-junit5-grundlagen.mdx) – Maven, Assertions, AssertJ, `@ParameterizedTest`, Tags
7. [API-Tests mit REST Assured](./03-java/02-rest-assured.mdx) – REST-APIs testen, JSON prüfen, Schema-Validierung (mit C#-Gegenstück)

**Browser**

8. [Playwright – Grundlagen](./04-browser/01-playwright-grundlagen.mdx) – Locators, Auto-Waiting, Web-First Assertions (C#)
9. [Selenium WebDriver](./04-browser/02-selenium-webdriver.mdx) – C# und Java, Locator-Strategien, explizites Warten
10. [Page Object Model](./04-browser/03-page-object-model.mdx) – wartbare Browser-Tests mit Page Objects und Komponenten

**Desktop (WPF)**

11. [FlaUI – Grundlagen](./05-desktop/01-flaui-grundlagen.mdx) – UI Automation, Elemente finden und bedienen, warten, Dialoge
12. [WPF testbar machen](./05-desktop/02-wpf-testbar-machen.mdx) – MVVM-Teststrategie, AutomationIds in XAML, Screen Objects, CI

**Performance und Last**

13. [Performance- und Lasttests – Grundlagen](./06-performance/01-performance-grundlagen.mdx) – Testarten, Metriken, Perzentile, Lastprofile, Engpässe
14. [Lasttests mit k6](./06-performance/02-lasttests-mit-k6.mdx) – Einkaufsablauf gegen den Mini-Shop, Checks, Schwellen, CI

**Barrierefreiheit**

15. [Barrierefreiheit – Grundlagen](./07-barrierefreiheit/01-barrierefreiheit-grundlagen.mdx) – BFSG, WCAG, Screenreader, semantisches HTML
16. [Barrierefreiheit testen](./07-barrierefreiheit/02-barrierefreiheit-testen.mdx) – axe-core mit Playwright, manuelle Prüfungen, Strategie

Die C#-, Java- und Desktop-Module kannst du auch in beliebiger Reihenfolge oder nur eines davon bearbeiten.

Querverbindungen: Selenium Grid, Playwright im Container und Testcontainers im Bereich 🐳 [Docker](../05-docker/05-docker-testautomation.mdx).
