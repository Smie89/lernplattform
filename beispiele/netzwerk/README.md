# Netzwerk-Beispiel: Subnetze, TCP, UDP, DNS und HTTP zum Anfassen

Kleine Python-Programme (nur Standardbibliothek) und 12 Tests, die die Grundlagen aus dem Bereich
**🌐 Netzwerke** greifbar machen: https://smie89.github.io/lernplattform/lernen/netzwerke

| Datei | Inhalt |
|---|---|
| `subnetz.py` | Netz, Maske, Broadcast, Host-Bereich, privat oder öffentlich, Netz aufteilen |
| `http_von_hand.py` | eine HTTP-Anfrage als Text über eine TCP-Verbindung – ohne Bibliothek |
| `test_netzwerk.py` | Subnetze, HTTP gegen einen lokalen Testserver, „Connection refused“, UDP, DNS |

```bash
cd beispiele/netzwerk
python -m unittest -v
python subnetz.py 192.168.10.37/26
python http_von_hand.py example.org 80 /
```

Alle Tests laufen lokal ohne Internet. Ein Befund aus der Entwicklung: Unter Windows meldet ein geschlossener
Port „Connection refused“ erst nach etwa 2 Sekunden, unter Linux sofort.

## Übungsideen

1. In wie viele /28-Netze lässt sich ein /24 aufteilen, und wie viele Hosts hat jedes?
2. Rufe mit `http_von_hand.py` den laufenden Mini-Shop auf (`localhost 5000 /api/produkte`). Welche Header schickt er?
3. Ergänze einen Test: Ein POST mit JSON-Body an den Testserver (Header `Content-Length` nicht vergessen).
4. Schneide den Verkehr eines Testlaufs mit Wireshark auf dem Loopback-Adapter mit und finde den TCP-Handshake.
