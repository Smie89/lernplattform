# Linux-Beispiele der Lernplattform

Dateien und Skripte zu den Lektionen im Bereich **🐧 Linux**:
https://smie89.github.io/lernplattform/lernen/linux

| Datei | Lektion | Inhalt |
|---|---|---|
| `testlauf.log` | Texte, Pipes und Umleitungen | Beispiel-Testlog zum Üben von `grep`, `awk`, `sort`, `uniq` |
| `log-auswertung.sh` | Bash-Skripte | wertet ein Testlog aus; Exit-Code 1 bei Fehlern |
| `warte-auf-dienst.sh` | Bash-Skripte | wartet mit Timeout, bis eine URL antwortet |
| `tests-mit-app.sh` | Bash-Skripte | startet den Mini-Shop, wartet, führt Tests aus, räumt mit `trap` auf |
| `selbsttest.sh` | – | prüft die Skripte (läuft auch in der GitHub Action) |

## Ausprobieren

```bash
cd beispiele/linux
./log-auswertung.sh testlauf.log; echo "Exit-Code: $?"
./warte-auf-dienst.sh https://example.com 10
./selbsttest.sh

# Mini-Shop starten, UI-Tests gegen die laufende Anwendung, aufräumen (benötigt .NET 10):
cd ../shop && dotnet build && ../linux/tests-mit-app.sh
```

Unter Windows funktionieren die Skripte in **Git Bash** oder **WSL**.
