---
title: Überblick Softwareentwicklung
sidebar_label: Überblick
---

# Überblick Softwareentwicklung

Gute Testautomation ist Softwareentwicklung: Testcode braucht dieselbe Sorgfalt wie Produktivcode.
Alle Codebeispiele dieses Bereichs liegen lauffähig und getestet im Repository – in
[beispiele/entwicklung](https://github.com/Smie89/lernplattform/tree/main/beispiele/entwicklung) (C#, NUnit) und
[beispiele/entwicklung-java](https://github.com/Smie89/lernplattform/tree/main/beispiele/entwicklung-java) (Java).

Empfohlene Reihenfolge:

1. [Objektorientierung](./01-objektorientierung.mdx) – Klassen, Kapselung, Vererbung, Interfaces, Polymorphie, Komposition
2. [C# und Java im Vergleich](./02-csharp-und-java.mdx) – Geldbeträge, Records, null, LINQ und Streams, Musterabgleich
3. [Clean Code](./03-clean-code.mdx) – Namen, Funktionen, Kommentare, Fehlerbehandlung, DRY/KISS/YAGNI, Code Smells
4. [SOLID-Prinzipien](./04-solid.mdx) – am Mini-Shop, und warum SOLID Code testbar macht
5. [Entwurfsmuster](./05-entwurfsmuster.mdx) – Strategie, Fabrik, Builder, Dekorierer, Beobachter, Singleton, Repository
6. [Refactoring](./06-refactoring.mdx) – Charakterisierungstests und ein vollständiges Vorher-nachher-Beispiel
7. [Git – Grundlagen](./07-git-grundlagen.mdx) – Commits, .gitignore, Branches, Merge-Konflikte, Rückgängig machen
8. [Zusammenarbeit und CI/CD](./08-zusammenarbeit-ci-cd.mdx) – Pull Requests, Code-Review, Pipelines, SemVer
9. [GitHub Actions vertieft](./09-github-actions-vertieft.mdx) – Matrix, Caching, Artefakte, Rechte, OIDC, Lieferkette – an den echten Pipelines
10. [Teststrategie in der Pipeline](./10-pipelines-teststrategie.mdx) – Stufen, Qualitätsschranken, Flaky Tests, Auslieferung, Azure DevOps

Querverbindungen: Tests für diesen Code schreibst du im Bereich 🤖 [Testautomation](../02-testautomation/00-ueberblick.md),
Reviews und Testentwurf behandelt der Bereich 🧪 [Softwaretest](../01-softwaretest/00-ueberblick.md).
