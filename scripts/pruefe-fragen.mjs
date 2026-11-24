// Prüft alle *.fragen.yaml-Dateien:
//  - Pflichtfelder vorhanden, gültiger Typ
//  - IDs global eindeutig
//  - "richtig"-Indizes passen zu den Optionen
//  - "artikel"-Anker existieren im gebauten HTML (nach "npm run build")
//
// Aufruf: npm run pruefen

import {readFileSync, readdirSync, existsSync, statSync} from 'node:fs';
import {join, relative, dirname, basename} from 'node:path';
import {parse} from 'yaml';

const DOCS = 'docs';
const BUILD = 'build';
const ROUTE_BASE = 'lernen';
const TYPEN = ['single', 'multiple', 'wahr-falsch'];

function findeDateien(ordner, endung) {
  return readdirSync(ordner).flatMap((name) => {
    const pfad = join(ordner, name);
    if (statSync(pfad).isDirectory()) return findeDateien(pfad, endung);
    return pfad.endsWith(endung) ? [pfad] : [];
  });
}

// docs/05-docker/02-dockerfile.fragen.yaml -> build/lernen/docker/dockerfile.html
// (Zahlen-Präfixe entfernen; Ordner-Slug kommt aus _category_.json)
function htmlPfadZu(yamlPfad) {
  const teile = relative(DOCS, dirname(yamlPfad)).split(/[\\/]/).filter(Boolean);
  const slugTeile = [];
  let ordner = DOCS;
  for (const teil of teile) {
    ordner = join(ordner, teil);
    const kategorie = join(ordner, '_category_.json');
    const slug = existsSync(kategorie) ? JSON.parse(readFileSync(kategorie, 'utf8')).link?.slug : null;
    if (slug) slugTeile.splice(0, slugTeile.length, ...slug.split('/').filter(Boolean));
    else slugTeile.push(teil.replace(/^\d+-/, ''));
  }
  const datei = basename(yamlPfad, '.fragen.yaml').replace(/^\d+-/, '');
  return join(BUILD, ROUTE_BASE, ...slugTeile, `${datei}.html`);
}

const fehler = [];
const ids = new Map();
const dateien = findeDateien(DOCS, '.fragen.yaml');
const buildDa = existsSync(BUILD);
let anzahl = 0;

for (const datei of dateien) {
  const fragen = parse(readFileSync(datei, 'utf8')) ?? [];
  const htmlPfad = htmlPfadZu(datei);
  const html = buildDa && existsSync(htmlPfad) ? readFileSync(htmlPfad, 'utf8') : null;
  if (buildDa && !html) fehler.push(`${datei}: gebaute Seite ${htmlPfad} nicht gefunden`);

  for (const f of fragen) {
    anzahl++;
    const wo = `${datei} [${f.id ?? '?'}]`;
    for (const feld of ['id', 'typ', 'frage', 'richtig', 'erklaerung', 'artikel']) {
      if (f[feld] === undefined) fehler.push(`${wo}: Feld "${feld}" fehlt`);
    }
    if (!TYPEN.includes(f.typ)) fehler.push(`${wo}: unbekannter Typ "${f.typ}"`);
    if (ids.has(f.id)) fehler.push(`${wo}: ID doppelt (auch in ${ids.get(f.id)})`);
    ids.set(f.id, datei);

    const optionen = f.typ === 'wahr-falsch' ? 2 : (f.optionen ?? []).length;
    if (f.typ !== 'wahr-falsch' && optionen < 2) fehler.push(`${wo}: weniger als 2 Optionen`);
    const richtig = f.richtig ?? [];
    if (richtig.length === 0) fehler.push(`${wo}: keine richtige Antwort`);
    if (richtig.some((i) => !Number.isInteger(i) || i < 0 || i >= optionen)) {
      fehler.push(`${wo}: Index in "richtig" außerhalb der Optionen (${richtig})`);
    }
    if (f.typ !== 'multiple' && richtig.length > 1) fehler.push(`${wo}: Typ ${f.typ}, aber mehrere richtige Antworten`);

    const anker = String(f.artikel ?? '').match(/^#(.+)$/)?.[1];
    // Minifiziertes HTML: id=anker oder id="anker"
    const ankerRegex = new RegExp(`id=("?)${anker?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\1[\\s>]`);
    if (html && anker && !ankerRegex.test(html)) fehler.push(`${wo}: Anker #${anker} existiert nicht im Artikel`);
  }
}

console.log(`${dateien.length} Fragen-Dateien, ${anzahl} Fragen geprüft${buildDa ? '' : ' (ohne Anker-Prüfung: erst "npm run build" ausführen)'}.`);
if (fehler.length) {
  console.error(`\n${fehler.length} Fehler:\n- ` + fehler.join('\n- '));
  process.exit(1);
}
console.log('Alles in Ordnung ✔');
