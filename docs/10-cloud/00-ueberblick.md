---
title: Überblick Cloud
sidebar_label: Überblick
---

# Überblick Cloud

Testumgebungen, CI-Runner, verwaltete Datenbanken, Lastgeneratoren – vieles davon läuft heute in der
**Cloud**. Wer testet oder in die Security wechseln möchte, braucht deshalb ein Grundverständnis davon, wie Cloud-Dienste
aufgebaut sind, wer wofür verantwortlich ist und wo typische Fehler entstehen. Fehlkonfigurierte Cloud-Dienste gehören zu
den häufigsten Ursachen großer Datenlecks.

Das Beispielprojekt [beispiele/cloud](https://github.com/Smie89/lernplattform/tree/main/beispiele/cloud) braucht weder
Cloud-Konto noch Kosten: Zwei Terraform-Konfigurationen werden nur mit einem Scanner geprüft – inklusive einer echten Lücke
des Scanners.

Empfohlene Reihenfolge:

1. [Cloud-Grundlagen](./01-cloud-grundlagen.mdx) – Servicemodelle, Regionen, geteilte Verantwortung, Kosten, Azure/AWS/GCP im Vergleich
2. [Identitäten und Cloud-Sicherheit](./02-cloud-sicherheit.mdx) – IAM, Least Privilege, verwaltete Identitäten, Netzwerk, Secrets, Logging
3. [Infrastructure as Code](./03-infrastructure-as-code.mdx) – Terraform, Testumgebungen auf Abruf, IaC-Scans mit Checkov in der Pipeline

Querverbindungen: Container im Bereich 🐳 [Docker](../05-docker/00-ueberblick.md), Netzwerke im Bereich
🌐 [Netzwerke](../09-netzwerke/00-ueberblick.md), Härtung und DevSecOps im Bereich 🔐 [Cybersecurity](../07-cybersecurity/00-ueberblick.md).
