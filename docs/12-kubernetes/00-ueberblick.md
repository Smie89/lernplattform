---
title: Überblick Kubernetes
sidebar_label: Überblick
---

# Überblick Kubernetes

Docker startet einzelne Container. **Kubernetes** betreibt viele Container auf vielen Rechnern: Es startet sie neu, wenn sie
abstürzen, verteilt Anfragen, rollt neue Versionen ohne Ausfall aus und hält den Zustand, den man beschreibt. Fast jede
größere Anwendung läuft heute so – und damit auch viele Testumgebungen.

Für Tester heißt das: Fehler entstehen nicht mehr nur im Code, sondern auch in der **Bereitstellung** – falsche Probes,
zu knappe Speichergrenzen, fehlende Konfiguration, Zustand, der zwischen Pods verloren geht.

Das Beispielprojekt [beispiele/kubernetes](https://github.com/Smie89/lernplattform/tree/main/beispiele/kubernetes) bringt den
Mini-Shop in einen echten Kubernetes-Cluster (kind) in der CI und testet ihn dort – mit einem echten Befund.

Empfohlene Reihenfolge:

1. [Kubernetes-Grundlagen](./01-kubernetes-grundlagen.mdx) – Architektur, Pods, Deployments, Services, Namespaces, Labels, kubectl
2. [Konfiguration und Betrieb](./02-konfiguration-betrieb.mdx) – ConfigMaps, Secrets, Probes, Ressourcen, Rolling Updates, Sicherheit, Fehlersuche
3. [Testen mit Kubernetes](./03-testen-mit-kubernetes.mdx) – Manifeste prüfen, kind in der CI, Rauch- und Resilienztests, Testumgebung pro Pull Request

Voraussetzung: der Bereich 🐳 [Docker](../05-docker/00-ueberblick.md). Querverbindungen: ☁️ [Cloud](../10-cloud/00-ueberblick.md)
und 🔐 [Systemhärtung](../07-cybersecurity/05-systemhaertung.mdx).
