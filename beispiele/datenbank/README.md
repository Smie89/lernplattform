# Datenbank-Beispiel: SQL lernen und testen

Die Daten des Mini-Shops als **SQLite**-Datenbank (in Python eingebaut, nichts zu installieren) –
mit allen Abfragen aus den Lektionen und Tests für Abfragen, Constraints, Transaktionen und Indizes.
Erklärt im Bereich **🗄️ Datenbanken und SQL**: https://smie89.github.io/lernplattform/lernen/datenbanken

| Datei | Inhalt |
|---|---|
| `schema.sql` | Tabellen mit Primär- und Fremdschlüsseln, UNIQUE, CHECK, Index |
| `daten.sql` | Testdaten mit Sonderfällen (Kunde ohne Bestellung, Stornierung, ausverkauftes Produkt) |
| `abfragen.py` | Abfragen aus den Lektionen: WHERE, JOIN, LEFT JOIN, GROUP BY/HAVING, Unterabfrage |
| `bestellen.py` | Bestellung als Transaktion – alles oder nichts |
| `test_datenbank.py` | 20 Tests: Ergebnisse, Constraints, Rollback, Index, Isolation |

```bash
cd beispiele/datenbank
python -m unittest -v
```

Zum Ausprobieren eigener Abfragen:

```bash
python -c "import datenbank; db = datenbank.verbinden(); print(db.execute('SELECT * FROM kunden').fetchall())"
```

Oder mit einem grafischen Werkzeug wie **DB Browser for SQLite** bzw. **DBeaver**: neue Datenbank anlegen,
`schema.sql` und `daten.sql` ausführen.

## Übungsideen

1. Welche Produkte hat Anna bestellt? (JOIN über drei Tabellen, Filter auf den Namen)
2. Umsatz pro Kategorie – ohne stornierte Bestellungen.
3. Schreibe einen Test, der prüft, dass eine Bestellung mit Menge 0 abgelehnt wird.
4. Lege einen Index auf `bestellungen(datum)` an. Was zeigt `EXPLAIN QUERY PLAN` danach?
