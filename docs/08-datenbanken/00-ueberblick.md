---
title: Überblick Datenbanken und SQL
sidebar_label: Überblick
---

# Überblick Datenbanken und SQL

Fast jede Anwendung speichert ihre Daten in einer Datenbank – und fast jeder Testautomatisierer muss früher oder später
Testdaten anlegen, Ergebnisse in der Datenbank prüfen oder herausfinden, warum ein Test „die falschen Daten“ sieht.
Dafür braucht man **SQL**. Nebenbei ist SQL die Grundlage, um [SQL-Injection](../07-cybersecurity/02-web-schwachstellen.mdx#sql-injection)
wirklich zu verstehen.

Alle Beispiele laufen gegen die Daten des Mini-Shops in
[beispiele/datenbank](https://github.com/Smie89/lernplattform/tree/main/beispiele/datenbank) – eine SQLite-Datenbank,
die in Python bereits eingebaut ist. 20 Tests prüfen jede Abfrage aus den Lektionen.

Empfohlene Reihenfolge:

1. [SQL-Grundlagen](./01-sql-grundlagen.mdx) – Tabellen, Schlüssel, SELECT, WHERE, ORDER BY, NULL
2. [JOINs und Auswertungen](./02-joins-aggregation.mdx) – INNER und LEFT JOIN, GROUP BY, HAVING, Unterabfragen
3. [Daten ändern, Constraints und Transaktionen](./03-daten-aendern-transaktionen.mdx) – INSERT, UPDATE, DELETE, ACID, Indizes
4. [Datenbanken in automatisierten Tests](./04-datenbanken-im-test.mdx) – Testdaten, Isolation, Testcontainers, Prüfungen in der Datenbank

:::tip[SQL ist überall fast gleich]
Die Beispiele nutzen SQLite. Die Grundbefehle funktionieren genauso in PostgreSQL, SQL Server, MySQL und Oracle;
Unterschiede gibt es bei Datentypen, Datumsfunktionen und Details wie `LIMIT` (SQL Server: `TOP`).
:::
