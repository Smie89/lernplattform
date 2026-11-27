/*
 * Lernfortschritt zwischen Geräten übertragen – ohne Server.
 *
 * Alles, was die Plattform speichert, liegt im localStorage unter Schlüsseln mit "lernplattform.":
 *   lernplattform.fortschritt.v1       Wiederholungsplan je Frage   {id: {richtig, falsch, zuletzt, stufe, faellig, …}}
 *   lernplattform.pruefung.<Name>      Prüfungssimulation           {verlauf: [...], laufend?: {...}}
 *
 * Export: alles einsammeln → JSON → gzip → Base64 mit Präfix "LP1:" (ein kopierbarer Code) oder als Datei.
 * Import: führt zusammen statt zu überschreiben – pro Frage gewinnt der neuere Stand, Prüfungsergebnisse werden
 * vereinigt. Auf keinem Gerät geht dadurch etwas verloren.
 *
 * Bewusst ohne Abhängigkeiten von React oder dem Browser-Speicher: scripts/uebertragung.test.mjs testet es mit Node.
 */

export const PRAEFIX = 'lernplattform.';
export const FORMAT = 'lernplattform-sicherung';
const FORTSCHRITT = 'lernplattform.fortschritt.v1';
const PRUEFUNG = 'lernplattform.pruefung.';
const VERLAUF_MAX = 20;

/** Sammelt alle Einträge der Plattform aus einem Storage-ähnlichen Objekt (localStorage). */
export function sammeln(speicher, jetzt = new Date()) {
  const daten = {};
  for (let i = 0; i < speicher.length; i++) {
    const schluessel = speicher.key(i);
    if (!schluessel?.startsWith(PRAEFIX)) continue;
    try {
      daten[schluessel] = JSON.parse(speicher.getItem(schluessel));
    } catch {
      // beschädigter Eintrag – überspringen statt den ganzen Export abzubrechen
    }
  }
  return {format: FORMAT, version: 1, erstellt: jetzt.toISOString(), daten};
}

/** Kennzahlen für die Anzeige. */
export function zusammenfassen(daten) {
  const fragen = Object.keys(daten[FORTSCHRITT] ?? {}).length;
  const pruefungen = Object.entries(daten)
    .filter(([s]) => s.startsWith(PRUEFUNG))
    .reduce((summe, [, wert]) => summe + (wert?.verlauf?.length ?? 0), 0);
  return {fragen, pruefungen};
}

const zeitpunkt = (eintrag) => Date.parse(eintrag?.zuletzt ?? '') || 0;

function fortschrittZusammenfuehren(lokal = {}, fremd = {}, bericht) {
  const ergebnis = {...lokal};
  for (const [id, eintrag] of Object.entries(fremd)) {
    if (!eintrag || typeof eintrag !== 'object') continue;
    if (!(id in ergebnis)) {
      ergebnis[id] = eintrag;
      bericht.fragenNeu++;
    } else if (zeitpunkt(eintrag) > zeitpunkt(ergebnis[id])) {
      ergebnis[id] = eintrag;   // zuletzt auf dem anderen Gerät beantwortet
      bericht.fragenAktualisiert++;
    } else {
      bericht.fragenUnveraendert++;
    }
  }
  return ergebnis;
}

function pruefungZusammenfuehren(lokal = {}, fremd = {}, bericht) {
  const nachDatum = new Map((lokal.verlauf ?? []).map((v) => [v.datum, v]));
  for (const v of fremd.verlauf ?? []) {
    if (v && !nachDatum.has(v.datum)) {
      nachDatum.set(v.datum, v);
      bericht.pruefungenNeu++;
    }
  }
  const verlauf = [...nachDatum.values()].sort((a, b) => b.datum - a.datum).slice(0, VERLAUF_MAX);
  // Eine laufende Prüfung wird nicht übertragen: Ihre Zeit läuft auf dem anderen Gerät ohnehin weiter.
  return lokal.laufend ? {...lokal, verlauf} : {verlauf};
}

/**
 * Führt eine importierte Sicherung mit den lokalen Daten zusammen.
 * @returns {{daten: object, bericht: {fragenNeu, fragenAktualisiert, fragenUnveraendert, pruefungenNeu}}}
 */
export function zusammenfuehren(lokal, fremd) {
  const bericht = {fragenNeu: 0, fragenAktualisiert: 0, fragenUnveraendert: 0, pruefungenNeu: 0};
  const daten = {...lokal};
  for (const [schluessel, wert] of Object.entries(fremd)) {
    if (!schluessel.startsWith(PRAEFIX)) continue;
    if (schluessel === FORTSCHRITT) daten[schluessel] = fortschrittZusammenfuehren(lokal[schluessel], wert, bericht);
    else if (schluessel.startsWith(PRUEFUNG)) daten[schluessel] = pruefungZusammenfuehren(lokal[schluessel], wert, bericht);
    else if (!(schluessel in daten)) daten[schluessel] = wert;   // Unbekanntes nur ergänzen, nie überschreiben
  }
  return {daten, bericht};
}

// ---------- Code: JSON → gzip → Base64 ----------

function zuBase64(bytes) {
  let text = '';
  for (let i = 0; i < bytes.length; i += 0x8000) text += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(text);
}

function ausBase64(text) {
  const roh = atob(text);
  const bytes = new Uint8Array(roh.length);
  for (let i = 0; i < roh.length; i++) bytes[i] = roh.charCodeAt(i);
  return bytes;
}

async function durchStrom(bytes, strom) {
  const antwort = new Response(new Blob([bytes]).stream().pipeThrough(strom));
  return new Uint8Array(await antwort.arrayBuffer());
}

/** Sicherung als kurzer, kopierbarer Code. */
export async function kodieren(sicherung) {
  const bytes = new TextEncoder().encode(JSON.stringify(sicherung));
  if (typeof CompressionStream === 'function') {
    return 'LP1:' + zuBase64(await durchStrom(bytes, new CompressionStream('gzip')));
  }
  return 'LP0:' + zuBase64(bytes);   // ältere Browser: unkomprimiert
}

/** Liest einen Code ("LP1:…", "LP0:…") oder den Inhalt einer Sicherungsdatei (JSON). */
export async function dekodieren(eingabe) {
  const text = String(eingabe).replace(/\s+/g, '');
  if (!/^(\{|LP[01]:)/.test(text)) throw new Error('Das ist kein Code der Lernplattform. Er beginnt mit „LP1:“.');

  let sicherung;
  try {
    let json;
    if (text.startsWith('{')) json = String(eingabe);
    else if (text.startsWith('LP1:')) json = new TextDecoder().decode(await durchStrom(ausBase64(text.slice(4)), new DecompressionStream('gzip')));
    else json = new TextDecoder().decode(ausBase64(text.slice(4)));
    sicherung = JSON.parse(json);
  } catch {
    // Base64-, gzip- oder JSON-Fehler: für den Nutzer ist es immer dasselbe – der Code ist nicht vollständig
    throw new Error('Der Code ist unvollständig oder beschädigt. Bitte noch einmal vollständig kopieren.');
  }
  if (sicherung?.format !== FORMAT || typeof sicherung.daten !== 'object') {
    throw new Error('Die Daten stammen nicht von der Lernplattform.');
  }
  return sicherung;
}
