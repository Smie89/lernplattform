// Webpack-/Rspack-Loader für *.fragen.yaml
//
// Wie yaml-loader, ergänzt aber jede Frage um ihre Herkunft – gebraucht von der Seite
// "Wiederholen", die Fragen aus allen Lektionen mischt:
//   lektion: Titel aus der ersten Zeile  # Fragen zur Lektion "…"
//   bereich: Label aus dem _category_.json des Bereichs (z. B. "🐧 Linux")
//   seite:   Pfad der Lektion (z. B. /lernen/linux/bash-skripte) – Grundlage für Artikel-Links
// Die Pfadlogik entspricht scripts/pruefe-fragen.mjs.

const fs = require('node:fs');
const path = require('node:path');
const {parse} = require('yaml');

module.exports = function fragenLoader(quelle) {
  const datei = this.resourcePath;
  const docs = path.join(this.rootContext, 'docs');
  const lektion = quelle.match(/^# Fragen zur Lektion "(.+)"/m)?.[1] ?? '';

  let slug = [];
  let bereich = '';
  let ordner = docs;
  for (const teil of path.relative(docs, path.dirname(datei)).split(path.sep).filter(Boolean)) {
    ordner = path.join(ordner, teil);
    const kategorieDatei = path.join(ordner, '_category_.json');
    let kategorie = null;
    if (fs.existsSync(kategorieDatei)) {
      this.addDependency(kategorieDatei);
      kategorie = JSON.parse(fs.readFileSync(kategorieDatei, 'utf8'));
    }
    if (!bereich && kategorie?.label) bereich = kategorie.label;
    if (kategorie?.link?.slug) slug = kategorie.link.slug.split('/').filter(Boolean);
    else slug.push(teil.replace(/^\d+-/, ''));
  }
  const seite = '/lernen/' + [...slug, path.basename(datei, '.fragen.yaml').replace(/^\d+-/, '')].join('/');

  const fragen = (parse(quelle) ?? []).map((frage) => ({...frage, lektion, bereich, seite}));
  return `export default ${JSON.stringify(fragen)};`;
};
