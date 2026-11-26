# Codebeispiele zum Bereich Softwareentwicklung (C#)

Alle C#-Beispiele der Lektionen – lauffähig und mit NUnit getestet:
https://smie89.github.io/lernplattform/lernen/softwareentwicklung

| Ordner | Lektion | Inhalt |
|---|---|---|
| `Oop/` | Objektorientierung | `Lagerbestand` (Kapselung), `Versandart` (Vererbung, Polymorphie) |
| `Sprachvergleich/` | C# und Java im Vergleich | Records, LINQ, null-Behandlung, Musterabgleich – Gegenstück: `../entwicklung-java/Sprachvergleich.java` |
| `Muster/` | SOLID, Entwurfsmuster | Strategie (`IRabattregel`, `Preisrechner`), Fabrik, Dekorierer, Beobachter |
| `Refactoring/` | Refactoring | `RechnungVorher` und `RechnungNachher` mit Charakterisierungstests |

```powershell
cd beispiele/entwicklung
dotnet test                       # benötigt das .NET 10 SDK

cd ../entwicklung-java
java Sprachvergleich.java         # benötigt ein JDK 21 – prüft sich selbst
```
