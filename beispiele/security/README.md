# Security-Beispiel: Schwachstellen finden, beheben und testen

Sechs typische Schwachstellen, jeweils **absichtlich unsicher** (`unsicher.py`) und **behoben**
(`sicher.py`), dazu Tests, die jeden Angriff gegen beide Varianten ausführen – und eine kleine
Erkennungsregel für Angriffe in SSH-Logs. Reines Python, keine Bibliotheken nötig.
Erklärt im Bereich **🔐 Cybersecurity**: https://smie89.github.io/lernplattform/lernen/cybersecurity

> ⚠️ `unsicher.py` dient nur zum Lernen. Die Angriffe laufen ausschließlich gegen diesen lokalen Code –
> Angriffe auf fremde Systeme ohne schriftliche Erlaubnis sind strafbar (§ 202a ff. StGB).

| Datei | Inhalt |
|---|---|
| `unsicher.py` | SQL-Injection, XSS, Path Traversal, IDOR, MD5 ohne Salt |
| `sicher.py` | dieselben Funktionen sicher: parametrisierte Abfragen, Ausgabekodierung, Pfadprüfung, Autorisierung, scrypt mit Salt |
| `datenbank.py` | SQLite-Testdatenbank im Arbeitsspeicher (erfundene Daten) |
| `test_angriffe.py` | 27 Tests: Angriffe gelingen gegen `unsicher.py`, scheitern gegen `sicher.py` |
| `log_analyse.py`, `auth.log` | Brute-Force-Erkennung und Alarm bei erfolgreicher Anmeldung nach Fehlversuchen |
| `test_log_analyse.py` | 7 Tests für die Erkennungsregeln, inklusive ihrer Grenzen |
| `header_check.py` | prüft die Sicherheits-Header einer laufenden Webanwendung (fand 4 echte Befunde im Mini-Shop) |
| `test_header_check.py` | 7 Tests für den Header-Check mit den Antworten des Mini-Shops vor und nach der Behebung |

```bash
cd beispiele/security
python -m unittest -v          # 41 Tests
python log_analyse.py auth.log # Bericht wie aus einem SOC

pip install bandit             # statische Sicherheitsanalyse (SAST)
bandit sicher.py               # keine Befunde
bandit unsicher.py             # findet 2 der 6 Lücken – die übrigen finden nur die Tests

python header_check.py http://localhost:5000/   # gegen den laufenden Mini-Shop
```

Unter Windows: `python`, unter Linux/macOS meist `python3`. Benötigt Python 3.10 oder neuer.

## Übungsideen

1. Schreibe eine weitere SQL-Injection-Eingabe, z. B. `' OR '1'='1' --`. Gegen welche Variante gelingt sie?
2. Ergänze in `sicher.py` eine Sperre nach 5 Fehlversuchen pro Benutzer und teste sie.
3. Baue eine Erkennungsregel für „viele verschiedene Benutzernamen von einer IP“ (Password Spraying).
4. Warum findet Bandit die IDOR-Lücke nicht? Was müsste ein Werkzeug dafür wissen?
