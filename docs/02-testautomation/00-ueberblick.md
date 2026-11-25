---
title: Überblick Testautomation
sidebar_label: Überblick
---

# Überblick Testautomation

Empfohlene Reihenfolge:

**Grundlagen**
1. [Grundlagen der Testautomation](./01-grundlagen/01-grundlagen-testautomation.mdx) – Testpyramide, was automatisieren, AAA-Muster, FIRST
2. [Flaky Tests](./01-grundlagen/02-flaky-tests.mdx) – Ursachen finden und beseitigen, Retries und Quarantäne

**C# / .NET**

3. [NUnit – Grundlagen](./02-csharp/01-nunit-grundlagen.mdx) – Attribute, `Assert.That`, parametrisierte Tests, Setup/Teardown
4. [Testdoubles mit NSubstitute](./02-csharp/02-testdoubles-nsubstitute.mdx) – Stub, Mock, Fake; Abhängigkeiten ersetzen

**Java**

5. [JUnit 5 – Grundlagen](./03-java/01-junit5-grundlagen.mdx) – Maven, Assertions, AssertJ, `@ParameterizedTest`, Tags
6. [API-Tests mit REST Assured](./03-java/02-rest-assured.mdx) – REST-APIs testen, JSON prüfen, Schema-Validierung (mit C#-Gegenstück)

**Browser**

7. [Playwright – Grundlagen](./04-browser/01-playwright-grundlagen.mdx) – Locators, Auto-Waiting, Web-First Assertions (C#)
8. [Selenium WebDriver](./04-browser/02-selenium-webdriver.mdx) – C# und Java, Locator-Strategien, explizites Warten
9. [Page Object Model](./04-browser/03-page-object-model.mdx) – wartbare Browser-Tests mit Page Objects und Komponenten

**Desktop (WPF)**

10. [FlaUI – Grundlagen](./05-desktop/01-flaui-grundlagen.mdx) – UI Automation, Elemente finden und bedienen, warten, Dialoge
11. [WPF testbar machen](./05-desktop/02-wpf-testbar-machen.mdx) – MVVM-Teststrategie, AutomationIds in XAML, Screen Objects, CI

Die C#-, Java- und Desktop-Module kannst du auch in beliebiger Reihenfolge oder nur eines davon bearbeiten.

Querverbindungen: Selenium Grid, Playwright im Container und Testcontainers im Bereich 🐳 [Docker](../05-docker/05-docker-testautomation.mdx).
