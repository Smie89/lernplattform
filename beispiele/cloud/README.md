# Cloud-Beispiel: Infrastructure as Code prüfen

Zwei Terraform-Konfigurationen für Azure – ein Speicherkonto für Testberichte und eine Netzwerk-Sicherheitsgruppe
für eine Test-VM. `unsicher/` enthält typische Fehlkonfigurationen, `sicher/` die behobene Fassung.
Beide werden **nie ausgerollt**, sondern nur mit dem IaC-Scanner **Checkov** geprüft – es braucht also weder
Azure-Konto noch Kosten. Erklärt im Bereich **☁️ Cloud**: https://smie89.github.io/lernplattform/lernen/cloud

| Datei | Inhalt |
|---|---|
| `unsicher/main.tf` | HTTP erlaubt, TLS 1.0, öffentliche Blobs, SSH und RDP aus dem Internet |
| `sicher/main.tf` | Befunde behoben, 4 bewusst akzeptierte Befunde mit Begründung (`#checkov:skip`) |
| `pruefe_scan.py` | prüft, dass Checkov die wichtigsten Befunde meldet – und hält eine bekannte Lücke fest |

```bash
pip install checkov
cd beispiele/cloud
checkov -d sicher --framework terraform          # Passed 15, Failed 0, Skipped 4
checkov -d unsicher --framework terraform        # 13 Befunde
checkov -d unsicher --framework terraform -o json > checkov.json; python pruefe_scan.py checkov.json
```

**Bekannte Lücke:** `https_traffic_only_enabled = false` meldet Checkov (Version 3.4) nicht, weil die Regel
CKV_AZURE_3 noch den alten Attributnamen `enable_https_traffic_only` prüft – der Terraform-Provider hat ihn in
Version 4.0 umbenannt. Ein grüner Scan ist also kein Beweis für eine sichere Konfiguration.

## Übungsideen

1. Erlaube in `sicher/main.tf` Port 80 aus dem Internet. Welche Regel schlägt an?
2. Entferne einen `#checkov:skip`-Kommentar. Wie ließe sich der Befund wirklich beheben?
3. Installiere Trivy und vergleiche: `trivy config unsicher`. Findet es dieselben Befunde?
