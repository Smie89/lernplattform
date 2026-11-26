---
title: Überblick Linux
sidebar_label: Überblick
---

# Überblick Linux

Linux begegnet dir in der Testautomation überall: auf CI-Runnern, in Docker-Containern und auf Testservern.
Die Lektionen bauen aufeinander auf und schließen mit den typischen Linux-Stolperfallen in der CI.

Empfohlene Reihenfolge:

1. [Grundlagen und Dateisystem](./01-linux-grundlagen.mdx) – Übungsumgebung, Befehlsaufbau, Verzeichnisstruktur, Pfade, Dateien verwalten
2. [Texte, Pipes und Umleitungen](./02-text-und-pipes.mdx) – `grep`, `awk`, `sort | uniq -c`, `tail -f`, `find` – ein Testlog auswerten
3. [Benutzer und Rechte](./03-benutzer-und-rechte.mdx) – `sudo`, `chmod`, `chown`, „Permission denied“ in der CI
4. [Prozesse und Dienste](./04-prozesse-und-dienste.mdx) – `ps`, `kill`, Exit-Codes, belegte Ports, `systemctl`, `journalctl`, `df -h`
5. [Pakete, Netzwerk, SSH und Umgebungsvariablen](./05-pakete-netzwerk-ssh.mdx) – `apt`, `curl`, DNS, SSH-Schlüssel, `PATH`
6. [Bash-Skripte](./06-bash-skripte.mdx) – Variablen, Bedingungen, Schleifen, `set -euo pipefail`, `trap` – mit **getesteten Skripten**
7. [Linux in der Testautomation](./07-linux-testautomation.mdx) – lokal grün, CI rot: Pfade, Zeilenenden, Browser, Zeitzone, Secrets, cron

Zum Mitmachen: Die Beispieldateien und Skripte liegen im Repository unter
[beispiele/linux](https://github.com/Smie89/lernplattform/tree/main/beispiele/linux).

Querverbindungen: Container im Bereich 🐳 [Docker](../05-docker/00-ueberblick.md), Testprojekte im Bereich 🤖 [Testautomation](../02-testautomation/00-ueberblick.md).
