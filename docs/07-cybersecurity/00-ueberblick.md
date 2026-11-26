---
title: Überblick Cybersecurity
sidebar_label: Überblick
---

# Überblick Cybersecurity

Sicherheit ist **Qualität unter Angriff**: Software muss nicht nur bei normaler Nutzung funktionieren, sondern auch dann,
wenn jemand sie absichtlich missbraucht. Wer testen kann, hat dafür die beste Grundlage – Testfälle für „Was passiert, wenn
jemand das Falsche eingibt?“ sind der Kern von Sicherheitstests.

Dieser Bereich verbindet **Theorie, echten Code und Berufspraxis**. Im Beispielprojekt
[beispiele/security](https://github.com/Smie89/lernplattform/tree/main/beispiele/security) stehen sechs typische
Schwachstellen als unsicherer und als behobener Code nebeneinander, mit Tests, die jeden Angriff gegen beide
Varianten ausführen, einem Prüfer für Sicherheits-Header, einer statischen Sicherheitsanalyse in der CI und einer Erkennungsregel für Angriffe in Server-Logs
(reines Python, keine Bibliotheken nötig).

Empfohlene Reihenfolge:

1. [Grundlagen der Informationssicherheit](./01-security-grundlagen.mdx) – Schutzziele, Risiko, CVE/CVSS, Angreifer, Sicherheitsprinzipien
2. [Web-Schwachstellen verstehen und beheben](./02-web-schwachstellen.mdx) – OWASP Top 10, SQL-Injection, XSS, Path Traversal, Zugriffskontrolle
3. [Authentifizierung, Passwörter und Kryptografie](./03-authentifizierung-kryptografie.mdx) – Passwort-Hashing, MFA, Sessions, TLS, Secrets
4. [Sicherheitstests und DevSecOps](./04-sicherheitstests-devsecops.mdx) – Bedrohungsmodellierung, SAST, SCA, DAST, Pentests, Security in der CI
5. [Systeme und Netzwerke härten](./05-systemhaertung.mdx) – Ports, Firewall, SSH, Updates, Container, Backups
6. [Angriffe erkennen und auf Vorfälle reagieren](./06-erkennung-incident-response.mdx) – Logging, SIEM, Erkennungsregeln, Incident Response
7. [Berufseinstieg, Recht und Lernpfad](./07-karriere-und-recht.mdx) – Berufsbilder, Zertifikate, legale Übungsumgebungen, Hackerparagraf
8. [Web-Pentesting in der Praxis](./08-web-pentesting.mdx) – OWASP WSTG, Burp Suite und ZAP, echte Befunde im Mini-Shop behoben
9. [Übungslabor und Pentest-Bericht](./09-pentest-praxis-bericht.mdx) – Juice Shop, Notizen, Berichtsaufbau, CVSS, Nachtest

:::danger[Nur mit Erlaubnis]
Alle Angriffe in diesem Bereich laufen gegen **eigenen Code auf dem eigenen Rechner** oder gegen Übungsumgebungen, die
dafür gemacht sind. Wer fremde Systeme ohne schriftliche Erlaubnis angreift oder scannt, macht sich strafbar – mehr dazu in
[Berufseinstieg und Recht](./07-karriere-und-recht.mdx#recht).
:::

Querverbindungen: Risikobasiertes Testen im Bereich 🧪 [Softwaretest](../01-softwaretest/06-testmanagement.mdx),
Rechte und SSH im Bereich 🐧 [Linux](../04-linux/00-ueberblick.md), Images im Bereich 🐳 [Docker](../05-docker/00-ueberblick.md),
Prompt-Injection im Bereich 🧠 [KI-Systeme testen](../06-ki/06-ki-systeme-testen.mdx#prompt-injection).
