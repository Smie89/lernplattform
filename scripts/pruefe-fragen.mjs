// Prüft alle *.fragen.yaml-Dateien:
//  - Pflichtfelder vorhanden, gültiger Typ
//  - IDs global eindeutig
//  - typspezifisch: "richtig"-Indizes passen zu Optionen bzw. Codezeilen, Reihenfolge/Zuordnung
//    eindeutig, Lückenzahl passt zum Text
//  - "artikel"-Anker existieren im gebauten HTML (nach "npm run build")
//
// Aufruf: npm run pruefen

import {readFileSync, readdirSync, existsSync, statSync} from 'node:fs';
import {join, relative, dirname, basename} from 'node:path';
import {parse} from 'yaml';

const DOCS = 'docs';
const BUILD = 'build';
const ROUTE_BASE = 'lernen';
const TYPEN = ['single', 'multiple', 'wahr-falsch', 'fehler-finden', 'reihenfolge', 'zuordnen', 'lueckentext'];

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
const typen = {};

const eindeutig = (liste) => new Set(liste.map(String)).size === liste.length;

function pruefeIndizes(richtig, anzahl, mehrereErlaubt) {
  const m = [];
  if (!Array.isArray(richtig) || richtig.length === 0) m.push('keine richtige Antwort');
  else {
    if (richtig.some((i) => !Number.isInteger(i) || i < 0 || i >= anzahl)) m.push(`Index in "richtig" außerhalb (${richtig}, erlaubt 0–${anzahl - 1})`);
    if (!mehrereErlaubt && richtig.length > 1) m.push('mehrere richtige Antworten, Typ erlaubt nur eine');
    if (!eindeutig(richtig)) m.push('Index in "richtig" doppelt');
  }
  return m;
}

/** Typspezifische Prüfungen – liefert Fehlermeldungen. */
function pruefeTyp(f) {
  switch (f.typ) {
    case 'single':
    case 'multiple': {
      const optionen = f.optionen ?? [];
      const m = optionen.length < 2 ? ['weniger als 2 Optionen'] : [];
      if (!eindeutig(optionen)) m.push('Optionen doppelt');
      return [...m, ...pruefeIndizes(f.richtig, optionen.length, f.typ === 'multiple')];
    }
    case 'wahr-falsch':
      return pruefeIndizes(f.richtig, 2, false);
    case 'fehler-finden': {
      if (typeof f.code !== 'string' || !f.code.trim()) return ['Feld "code" fehlt'];
      const zeilen = f.code.replace(/\n+$/, '').split('\n');
      const m = pruefeIndizes(f.richtig, zeilen.length, true);
      if (Array.isArray(f.richtig) && f.richtig.some((i) => zeilen[i] !== undefined && !zeilen[i].trim())) m.push('"richtig" zeigt auf eine Leerzeile');
      return m;
    }
    case 'reihenfolge': {
      const e = f.elemente ?? [];
      const m = e.length < 3 ? ['weniger als 3 Elemente'] : [];
      if (!eindeutig(e)) m.push('Elemente doppelt');
      return m;
    }
    case 'zuordnen': {
      const p = f.paare ?? [];
      const m = p.length < 3 ? ['weniger als 3 Paare'] : [];
      if (p.some((x) => !Array.isArray(x) || x.length !== 2)) m.push('jedes Paar braucht genau 2 Einträge');
      else {
        if (!eindeutig(p.map((x) => x[0]))) m.push('linke Seiten doppelt');
        if (!eindeutig(p.map((x) => x[1]))) m.push('rechte Seiten doppelt – Zuordnung wäre nicht eindeutig');
      }
      return m;
    }
    case 'lueckentext': {
      if (typeof f.text !== 'string') return ['Feld "text" fehlt'];
      const anzahlLuecken = f.text.split('___').length - 1;
      const l = f.luecken ?? [];
      const m = anzahlLuecken === 0 ? ['Text enthält keine Lücke (___)'] : [];
      if (l.length !== anzahlLuecken) m.push(`${anzahlLuecken} Lücken im Text, aber ${l.length} Einträge in "luecken"`);
      if (l.some((x) => (Array.isArray(x) ? x : [x]).every((e) => !String(e).trim()))) m.push('Lücke ohne erlaubte Antwort');
      return m;
    }
    default:
      return [];
  }
}

for (const datei of dateien) {
  const fragen = parse(readFileSync(datei, 'utf8')) ?? [];
  const htmlPfad = htmlPfadZu(datei);
  const html = buildDa && existsSync(htmlPfad) ? readFileSync(htmlPfad, 'utf8') : null;
  if (buildDa && !html) fehler.push(`${datei}: gebaute Seite ${htmlPfad} nicht gefunden`);

  for (const f of fragen) {
    anzahl++;
    const wo = `${datei} [${f.id ?? '?'}]`;
    for (const feld of ['id', 'typ', 'frage', 'erklaerung', 'artikel']) {
      if (f[feld] === undefined) fehler.push(`${wo}: Feld "${feld}" fehlt`);
    }
    if (!TYPEN.includes(f.typ)) fehler.push(`${wo}: unbekannter Typ "${f.typ}"`);
    if (ids.has(f.id)) fehler.push(`${wo}: ID doppelt (auch in ${ids.get(f.id)})`);
    ids.set(f.id, datei);
    typen[f.typ] = (typen[f.typ] ?? 0) + 1;
    for (const meldung of pruefeTyp(f)) fehler.push(`${wo}: ${meldung}`);

    const anker = String(f.artikel ?? '').match(/^#(.+)$/)?.[1];
    // Minifiziertes HTML: id=anker oder id="anker"
    const ankerRegex = new RegExp(`id=("?)${anker?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\1[\\s>]`);
    if (html && anker && !ankerRegex.test(html)) fehler.push(`${wo}: Anker #${anker} existiert nicht im Artikel`);
  }
}

console.log(`${dateien.length} Fragen-Dateien, ${anzahl} Fragen geprüft${buildDa ? '' : ' (ohne Anker-Prüfung: erst "npm run build" ausführen)'}.`);
console.log('Nach Typ: ' + Object.entries(typen).map(([t, n]) => `${t} ${n}`).join(', '));
if (fehler.length) {
  console.error(`\n${fehler.length} Fehler:\n- ` + fehler.join('\n- '));
  process.exit(1);
}
console.log('Alles in Ordnung ✔');
