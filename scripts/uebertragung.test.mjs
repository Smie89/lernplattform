// Tests für src/lib/uebertragung.mjs – Aufruf: node --test scripts/
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {dekodieren, kodieren, sammeln, zusammenfassen, zusammenfuehren} from '../src/lib/uebertragung.mjs';

/** Kleiner Ersatz für localStorage. */
function speicher(eintraege) {
  const schluessel = Object.keys(eintraege);
  return {length: schluessel.length, key: (i) => schluessel[i], getItem: (s) => eintraege[s]};
}

const frage = (zuletzt, stufe = 1) => ({richtig: 1, falsch: 0, zuletzt, zuletztRichtig: true, stufe, faellig: zuletzt});

test('sammeln nimmt nur Einträge der Plattform und überspringt beschädigte', () => {
  const s = sammeln(speicher({
    'lernplattform.fortschritt.v1': JSON.stringify({'a-1': frage('2026-11-01T10:00:00Z')}),
    'lernplattform.kaputt': '{nicht json',
    'anderes.programm': '{"x":1}',
  }));
  assert.deepEqual(Object.keys(s.daten), ['lernplattform.fortschritt.v1']);
  assert.equal(s.format, 'lernplattform-sicherung');
});

test('pro Frage gewinnt der neuere Stand', () => {
  const lokal = {'lernplattform.fortschritt.v1': {
    alt: frage('2026-11-01T10:00:00Z', 1),
    neu: frage('2026-11-20T10:00:00Z', 4),
  }};
  const fremd = {'lernplattform.fortschritt.v1': {
    alt: frage('2026-11-15T10:00:00Z', 3),   // auf dem anderen Gerät später beantwortet
    neu: frage('2026-11-02T10:00:00Z', 1),   // älter – lokal bleibt
    zusatz: frage('2026-11-03T10:00:00Z'),   // nur auf dem anderen Gerät
  }};
  const {daten, bericht} = zusammenfuehren(lokal, fremd);
  const f = daten['lernplattform.fortschritt.v1'];
  assert.equal(f.alt.stufe, 3);
  assert.equal(f.neu.stufe, 4);
  assert.ok(f.zusatz);
  assert.deepEqual(bericht, {fragenNeu: 1, fragenAktualisiert: 1, fragenUnveraendert: 1, pruefungenNeu: 0});
});

test('zweimal denselben Code einlesen ändert nichts mehr', () => {
  const fremd = {'lernplattform.fortschritt.v1': {a: frage('2026-11-03T10:00:00Z')}};
  const erst = zusammenfuehren({}, fremd).daten;
  const {daten, bericht} = zusammenfuehren(erst, fremd);
  assert.deepEqual(daten, erst);
  assert.equal(bericht.fragenNeu + bericht.fragenAktualisiert, 0);
});

test('Prüfungsergebnisse werden vereinigt, die laufende Prüfung bleibt lokal', () => {
  const schluessel = 'lernplattform.pruefung.CTAL-TAE v2.0';
  const lokal = {[schluessel]: {verlauf: [{datum: 300, punkte: 50}, {datum: 100, punkte: 30}], laufend: {start: 1}}};
  const fremd = {[schluessel]: {verlauf: [{datum: 200, punkte: 44}, {datum: 100, punkte: 30}], laufend: {start: 2}}};
  const {daten, bericht} = zusammenfuehren(lokal, fremd);
  assert.deepEqual(daten[schluessel].verlauf.map((v) => v.datum), [300, 200, 100]);
  assert.equal(daten[schluessel].laufend.start, 1);
  assert.equal(bericht.pruefungenNeu, 1);
});

test('fremde Schlüssel werden ignoriert, unbekannte eigene nur ergänzt', () => {
  const {daten} = zusammenfuehren(
    {'lernplattform.einstellung': 'lokal'},
    {'lernplattform.einstellung': 'fremd', 'lernplattform.neu': 1, 'boese.schluessel': 1},
  );
  assert.deepEqual(daten, {'lernplattform.einstellung': 'lokal', 'lernplattform.neu': 1});
});

test('Code hin und zurück ergibt dieselben Daten – und ist deutlich kürzer als das JSON', async () => {
  const fortschritt = {};
  for (let i = 0; i < 1200; i++) fortschritt[`frage-${i}`] = frage(`2026-11-${String((i % 28) + 1).padStart(2, '0')}T10:00:00Z`, i % 6);
  const sicherung = {format: 'lernplattform-sicherung', version: 1, erstellt: 'x', daten: {'lernplattform.fortschritt.v1': fortschritt}};
  const code = await kodieren(sicherung);
  assert.ok(code.startsWith('LP1:'));
  assert.ok(code.length < JSON.stringify(sicherung).length / 4, `Code ${code.length} Zeichen`);
  assert.deepEqual(await dekodieren(code), sicherung);
  assert.deepEqual(await dekodieren(` ${code.slice(0, 40)}\n${code.slice(40)} `), sicherung);   // Zeilenumbrüche beim Kopieren
  assert.equal(zusammenfassen(sicherung.daten).fragen, 1200);
});

test('Dateiinhalt (JSON) wird ebenfalls gelesen', async () => {
  const sicherung = {format: 'lernplattform-sicherung', version: 1, erstellt: 'x', daten: {}};
  assert.deepEqual(await dekodieren(JSON.stringify(sicherung, null, 2)), sicherung);
});

test('verständliche Fehlermeldungen', async () => {
  await assert.rejects(dekodieren('hallo'), /kein Code der Lernplattform/);
  await assert.rejects(dekodieren('LP1:' + 'A'.repeat(20)), /unvollständig oder beschädigt/);   // kein gzip
  await assert.rejects(dekodieren('LP1:§§§'), /unvollständig oder beschädigt/);                  // kein Base64
  const code = await kodieren({format: 'lernplattform-sicherung', version: 1, daten: {}});
  await assert.rejects(dekodieren(code.slice(0, -8)), /unvollständig oder beschädigt/);          // abgeschnitten
  await assert.rejects(dekodieren('{"format":"anders","daten":{}}'), /nicht von der Lernplattform/);
});
