# Python-Tests mit pytest

Beispielprojekt zum Bereich **Testautomation → Python mit pytest** der Lernplattform.

| Ordner | Inhalt |
|---|---|
| `shop/` | Python-Fassung der Shop-Logik (Rabatt, Warenkorb, Bestellung) und ein API-Client |
| `tests/unit/` | Unit-Tests: Fixtures, `parametrize`, `pytest.raises`, Mock, Fake, `monkeypatch`, Hypothesis |
| `tests/api/` | API-Tests gegen den laufenden .NET-Mini-Shop mit `requests` und JSON-Schema |
| `tests/ui/` | Browser-Tests mit `pytest-playwright` und einem Page Object |

## Einrichten

```bash
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python -m playwright install chromium
```

## Ausführen

```bash
pytest                             # alle Tests; API- und UI-Tests werden ohne SHOP_URL übersprungen
pytest tests/unit -v               # nur Unit-Tests, ausführlich
pytest -k rabatt                   # nur Tests mit "rabatt" im Namen
pytest -m api                      # nur Tests mit dem Marker "api"
```

API- und UI-Tests brauchen den laufenden Mini-Shop:

```bash
cd ../shop && dotnet build
../linux/tests-mit-app.sh bash -c "cd ../python && SHOP_URL=http://localhost:5000 pytest -m 'api or ui'"
```

Oder den Shop selbst starten (`dotnet run --project src/Shop.Web --urls http://localhost:5000`) und
`SHOP_URL=http://localhost:5000 pytest` aufrufen. Mit `--headed` sieht man den Browser.
