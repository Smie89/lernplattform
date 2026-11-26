---
title: Überblick Netzwerke
sidebar_label: Überblick
---

# Überblick Netzwerke

„Die Testumgebung ist nicht erreichbar“, „der Test läuft lokal, aber nicht in der CI“, „die API antwortet mit einem
Zertifikatsfehler“ – hinter vielen Problemen im Testalltag stecken Netzwerkfragen. Für den Weg in die
[Cybersecurity](../07-cybersecurity/00-ueberblick.md) sind Netzwerkgrundlagen ohnehin Pflicht: Angriffe, Firewalls,
Logs und Pentests setzen sie voraus.

Zum Ausprobieren gibt es [beispiele/netzwerk](https://github.com/Smie89/lernplattform/tree/main/beispiele/netzwerk):
Subnetze berechnen, eine HTTP-Anfrage von Hand über TCP schicken, TCP und UDP vergleichen – mit 12 Tests, die ohne
Internet laufen.

Empfohlene Reihenfolge:

1. [Schichtenmodell, IP-Adressen und Subnetze](./01-schichten-ip-subnetze.mdx) – OSI und TCP/IP, IPv4/IPv6, CIDR, private Netze, NAT, Routing
2. [TCP, UDP und Ports](./02-tcp-udp-ports.mdx) – Handshake, Zuverlässigkeit, Sockets, „refused“ oder „timeout“
3. [DNS](./03-dns.mdx) – Namensauflösung, Eintragstypen, TTL, Caching, typische Fehler
4. [HTTP und TLS im Detail](./04-http-tls.mdx) – Anfragen und Antworten, Header, Cookies, Caching, HTTP/2 und 3, TLS-Handshake, Proxys
5. [Netzwerkanalyse mit Wireshark](./05-netzwerkanalyse.mdx) – mitschneiden, filtern, Handshakes lesen, HAR-Dateien

Querverbindungen: Netzwerkbefehle unter Linux im Bereich 🐧 [Linux](../04-linux/05-pakete-netzwerk-ssh.mdx),
Container-Netzwerke im Bereich 🐳 [Docker](../05-docker/03-volumes-netzwerke.mdx), Ports und Firewall im Bereich
🔐 [Systeme härten](../07-cybersecurity/05-systemhaertung.mdx).
