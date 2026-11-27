// Docusaurus-Plugin: erzeugt beim Build ein Stichwortverzeichnis (A–Z) aus allen Lektionen.
//
// Einträge: Titel jeder Lektion und jede Abschnittsüberschrift (## und ###) mit Anker.
// Allgemeine Überschriften wie "Zusammenfassung" werden ausgelassen.
// Die Seite liegt unter /stichwortverzeichnis und funktioniert offline (Daten sind im Build enthalten).

const fs = require('node:fs');
const path = require('node:path');

const AUSLASSEN = new Set([
  'Typische Fehler', 'Zusammenfassung', 'Lernziele', 'Checkliste', 'Übungen', 'Überblick', 'Praxis',
]);

function dateien(ordner) {
  return fs.readdirSync(ordner).flatMap((name) => {
    const pfad = path.join(ordner, name);
    if (fs.statSync(pfad).isDirectory()) return dateien(pfad);
    return /\.mdx?$/.test(name) ? [pfad] : [];
  });
}

/** Route einer Lektion – gleiche Logik wie im fragen-loader. */
function route(docs, datei) {
  let slug = [];
  let bereich = '';
  let ordner = docs;
  for (const teil of path.relative(docs, path.dirname(datei)).split(path.sep).filter(Boolean)) {
    ordner = path.join(ordner, teil);
    const kat = path.join(ordner, '_category_.json');
    const k = fs.existsSync(kat) ? JSON.parse(fs.readFileSync(kat, 'utf8')) : null;
    if (!bereich && k?.label) bereich = k.label;
    if (k?.link?.slug) slug = k.link.slug.split('/').filter(Boolean);
    else slug.push(teil.replace(/^\d+-/, ''));
  }
  const name = path.basename(datei).replace(/\.mdx?$/, '').replace(/^\d+-/, '');
  return {pfad: '/lernen/' + [...slug, name].join('/'), bereich};
}

/** Überschrift von Markdown befreien: **fett**, `code`, [Link](…) */
function bereinigen(text) {
  return text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*/g, '')   // **fett** – einzelne * bleiben, z. B. COUNT(*)
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

module.exports = function stichwortverzeichnis(context) {
  return {
    name: 'stichwortverzeichnis',
    async loadContent() {
      const docs = path.join(context.siteDir, 'docs');
      const eintraege = [];
      for (const datei of dateien(docs)) {
        if (/00-(start|ueberblick)/.test(path.basename(datei))) continue;
        const text = fs.readFileSync(datei, 'utf8');
        const titel = text.match(/^title:\s*(.+)$/m)?.[1]?.replace(/^["']|["']$/g, '').trim();
        if (!titel) continue;
        const {pfad, bereich} = route(docs, datei);
        eintraege.push({begriff: titel, lektion: titel, bereich, link: pfad, art: 'lektion'});

        let imCode = false;
        for (const zeile of text.split('\n')) {
          if (zeile.startsWith('```')) imCode = !imCode;
          if (imCode) continue;
          const m = zeile.match(/^#{2,3} (.+?) \\\{#([a-z0-9-]+)\}\s*$/);
          if (!m) continue;
          const begriff = bereinigen(m[1]);
          if (AUSLASSEN.has(begriff)) continue;
          eintraege.push({begriff, lektion: titel, bereich, link: `${pfad}#${m[2]}`, art: 'abschnitt'});
        }
      }
      eintraege.sort((a, b) => a.begriff.localeCompare(b.begriff, 'de', {sensitivity: 'base'}));
      return eintraege;
    },
    async contentLoaded({content, actions}) {
      const daten = await actions.createData('stichwortverzeichnis.json', JSON.stringify(content));
      actions.addRoute({
        path: `${context.baseUrl}stichwortverzeichnis`,
        component: '@site/src/components/Stichwortverzeichnis/index.js',
        modules: {eintraege: daten},
        exact: true,
      });
    },
  };
};
