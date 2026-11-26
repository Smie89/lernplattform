"""Hängt neue Fragen aus einer Sammeldatei an die passenden *.fragen.yaml an.

Aufruf:  python scripts/fragen-anhaengen.py sammlung.yaml

Format der Sammeldatei: Abschnitte, die mit "### <Pfad unter docs ohne .fragen.yaml>" beginnen,
danach normale YAML-Listeneinträge, z. B.

### 04-linux/03-benutzer-und-rechte
- id: li-re-012
  typ: lueckentext
  ...

Bereits vorhandene IDs werden übersprungen, damit das Skript gefahrlos erneut laufen kann.
"""

import re
import sys
from pathlib import Path

DOCS = Path(__file__).resolve().parent.parent / "docs"
UEBERSCHRIFT = "\n# --- Interaktive Aufgaben ---\n"

text = Path(sys.argv[1]).read_text(encoding="utf-8-sig")  # -sig: ein BOM am Anfang stört nicht
for abschnitt in re.split(r"^### ", text, flags=re.M)[1:]:
    kopf, _, inhalt = abschnitt.partition("\n")
    ziel = DOCS / f"{kopf.strip()}.fragen.yaml"
    if not ziel.exists():
        sys.exit(f"Datei nicht gefunden: {ziel}")
    vorhanden = ziel.read_text(encoding="utf-8")
    vorhandene_ids = set(re.findall(r"^- id: (\S+)", vorhanden, re.M))
    bloecke = re.split(r"(?=^- id: )", inhalt.strip("\n") + "\n", flags=re.M)
    neu = []
    for block in bloecke:
        treffer = re.search(r"^- id: (\S+)", block, re.M)
        if treffer and treffer.group(1) not in vorhandene_ids:
            neu.append(block)
    if not neu:
        continue
    zusatz = ("" if UEBERSCHRIFT.strip() in vorhanden else UEBERSCHRIFT) + "\n" + "\n".join(b.rstrip("\n") + "\n" for b in neu)
    ziel.write_text(vorhanden.rstrip("\n") + "\n" + zusatz, encoding="utf-8", newline="\n")
    print(f"{ziel.relative_to(DOCS)}: {len(neu)} neue Fragen")
