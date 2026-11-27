# Mini-Shop auf Kubernetes

Beispielprojekt zum Bereich **Kubernetes** der Lernplattform: der .NET-Mini-Shop als Container in einem
Kubernetes-Cluster, mit Tests gegen den laufenden Cluster.

| Datei / Ordner | Inhalt |
|---|---|
| `Dockerfile` | Multi-Stage-Build des Shops, läuft als Nicht-root-Benutzer auf Port 8080 |
| `manifeste/` | Namespace, ConfigMap, Deployment (2 Replikate, Probes, Ressourcen, Sicherheitskontext), zwei Services, NetworkPolicy, Kustomization |
| `tests/` | pytest-Tests über `kubectl`: Bereitschaft, Service, Sicherheit, Selbstheilung und ein echter Befund zum Zustand |

## Lokal ausprobieren

Voraussetzungen: Docker, [kind](https://kind.sigs.k8s.io/) und kubectl.

```bash
docker build -t mini-shop:1.0 -f Dockerfile ../shop
kind create cluster --name lernplattform
kind load docker-image mini-shop:1.0 --name lernplattform
kubectl apply -k manifeste
kubectl -n mini-shop rollout status deployment/mini-shop

pip install -r requirements.txt
pytest tests -v

kubectl -n mini-shop port-forward service/mini-shop 8080:80   # dann http://localhost:8080
kind delete cluster --name lernplattform                       # aufräumen
```

Manifeste ohne Cluster prüfen:

```bash
pipx run --spec checkov==3.4.11 checkov -d manifeste --framework kubernetes --compact
```

Checkov läuft über `pipx` in einer eigenen Umgebung: Es verlangt `packaging<24`, pytest 9 dagegen `packaging>=24` –
in einer gemeinsamen Umgebung lassen sich beide nicht installieren.

## Der Befund

Der Shop speichert Warenkörbe im Arbeitsspeicher. Mit zwei Pods hinter dem Service `mini-shop` landen Folgeanfragen
zufällig beim anderen Pod, und der Warenkorb ist „weg“ (404). `tests/test_zustand.py` hält das fest. Der Service
`mini-shop-sticky` mit `sessionAffinity: ClientIP` umgeht das Problem; die eigentliche Lösung wäre ein gemeinsamer
Speicher wie Redis oder eine Datenbank.
