# Lernplattform

Persönliche Lernplattform für Testautomation, Softwaretest, Softwareentwicklung, Linux, Docker und KI.
Gebaut mit [Docusaurus](https://docusaurus.io/), gehostet auf GitHub Pages:
**https://smie89.github.io/lernplattform/**

## Lokal starten

```bash
npm install
npm start
```

Öffnet http://localhost:3000/lernplattform/ und lädt Änderungen automatisch neu.

Vom Smartphone im selben WLAN: `npm start -- --host 0.0.0.0` und dann `http://<PC-IP>:3000/lernplattform/` öffnen.

## Neue Lektion anlegen

1. Datei `docs/<bereich>/<modul>/NN-thema.mdx` anlegen (Vorlage: `docs/02-testautomation/04-browser/01-playwright-grundlagen.mdx`).
2. Überschriften mit Anker versehen, z. B. `## Auto-Waiting \{#auto-waiting}` (in .mdx muss die öffnende Klammer mit `\` maskiert werden).
3. Fragen in `NN-thema.fragen.yaml` daneben ablegen.
4. Am Ende des Artikels einbinden:

```mdx
import Quiz from '@site/src/components/Quiz';
import fragen from './NN-thema.fragen.yaml';

<Quiz fragen={fragen} titel="Quiz: Thema" />
```

### Artikel-Gliederung

1. Lernziele (`:::info[Lernziele]` – Titel von Hinweiskästen immer in eckigen Klammern)
2. Theorie (Überschriften mit Anker)
3. Praxisbeispiel (lauffähiger Code)
4. Typische Fehler
5. Zusammenfassung
6. Quiz

### Fragenformat

```yaml
- id: ta-pw-003            # eindeutig, Präfix = Bereich-Thema
  typ: single              # single | multiple | wahr-falsch
  schwierigkeit: 2         # 1-3
  frage: "Fragetext"
  optionen: ["A", "B", "C"]   # bei wahr-falsch weglassen
  richtig: [1]             # Index ab 0; wahr-falsch: [0]=wahr, [1]=falsch
  erklaerung: "Warum ..."
  artikel: "#anker"        # Sprungziel im Artikel
  tags: [playwright]
```

### Fragen prüfen

```bash
npm run build
npm run pruefen
```

Prüft alle `*.fragen.yaml`: Pflichtfelder, eindeutige IDs, gültige `richtig`-Indizes und ob jeder `artikel`-Anker im Artikel existiert. Läuft auch automatisch in der GitHub Action.

## Beispielprojekte

`beispiele/shop/` enthält eine lauffähige Testanwendung (Mini-Shop, .NET 10) mit Unit-, API- und UI-Tests –
Grundlage der Lektion „Tests strukturieren“. Details im [README des Projekts](beispiele/shop/README.md).
Die Tests laufen bei Änderungen automatisch per GitHub Action (`.github/workflows/beispiele.yml`).

## Veröffentlichen

Jeder Push auf `main` baut die Seite per GitHub Action (`.github/workflows/deploy.yml`) und veröffentlicht sie auf GitHub Pages.
