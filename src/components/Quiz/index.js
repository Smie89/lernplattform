import React, {useEffect, useMemo, useState, useCallback} from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import styles from './styles.module.css';
import {speichereErgebnis} from './fortschritt';
import {mischen, typVon} from './typen';

/*
 * Quiz-Komponente
 *
 * Verwendung in einer .mdx-Datei:
 *   import Quiz from '@site/src/components/Quiz';
 *   import fragen from './meine-lektion.fragen.yaml';
 *   <Quiz fragen={fragen} titel="Quiz: Meine Lektion" />
 *
 * Gemeinsame Felder jeder Frage (YAML):
 *   id, typ, frage, erklaerung, artikel ("#anker"), schwierigkeit (1-3), tags
 *
 * Fragetypen:
 *   single | multiple    optionen: [...], richtig: [Index ab 0, ...]
 *   wahr-falsch          richtig: [0] = wahr, [1] = falsch
 *   fehler-finden        sprache: csharp, code: |-Block, richtig: [Zeilenindex ab 0, ...]
 *   reihenfolge          elemente: [...] in der richtigen Reihenfolge (werden gemischt angezeigt)
 *   zuordnen             paare: [[links, rechts], ...] (rechte Seiten müssen eindeutig sein)
 *   lueckentext          text: "chmod ___ skript.sh", luecken: [["+x", "u+x"]], optional sprache, exakt: true
 *
 * Geprüft werden alle Fragen mit "npm run pruefen".
 */

function bereiteVor(frage, mischenErlaubt = true) {
  return typVon(frage).vorbereiten(frage, mischenErlaubt);
}

function artikelZiel(frage, zeigeHerkunft) {
  if (!frage.artikel) return null;
  // Auf der Wiederholungsseite brauchen "#anker"-Links den Pfad der Lektion davor.
  return zeigeHerkunft && frage.artikel.startsWith('#') && frage.seite ? frage.seite + frage.artikel : frage.artikel;
}

function Fortschrittsbalken({aktuell, gesamt}) {
  const prozent = Math.round((aktuell / gesamt) * 100);
  return (
    <div className={styles.balken} aria-hidden="true">
      <div className={styles.balkenFuellung} style={{width: `${prozent}%`}} />
    </div>
  );
}

export default function Quiz({fragen = [], titel = 'Quiz', mischeFragen = true, zeigeHerkunft = false, onFertig}) {
  // Erst ungemischt rendern (identisch zum vorgerenderten HTML),
  // dann im Browser mischen – sonst gibt es einen Hydration-Fehler.
  const [runde, setRunde] = useState(() => ({liste: fragen.map((f) => bereiteVor(f, false)), nr: 0}));
  useEffect(() => {
    setRunde({liste: (mischeFragen ? mischen(fragen) : fragen).map((f) => bereiteVor(f)), nr: 0});
  }, [fragen, mischeFragen]);
  const [antwort, setAntwort] = useState(null);
  const [geprueft, setGeprueft] = useState(false);
  const [ergebnisse, setErgebnisse] = useState([]); // {id, korrekt}

  const frage = runde.liste[runde.nr];
  const fertig = runde.nr >= runde.liste.length;
  const typ = frage ? typVon(frage) : null;
  const aktuelleAntwort = antwort ?? typ?.leer;

  const korrekt = useMemo(() => (frage ? typ.korrekt(frage, aktuelleAntwort) : false), [frage, typ, aktuelleAntwort]);

  const starte = useCallback((liste) => {
    setRunde({liste: mischen(liste).map((f) => bereiteVor(f)), nr: 0});
    setAntwort(null);
    setGeprueft(false);
    setErgebnisse([]);
  }, []);

  if (fragen.length === 0) {
    return <div className={styles.quiz}>Für diese Lektion gibt es noch keine Fragen.</div>;
  }

  const pruefe = () => {
    setGeprueft(true);
    setErgebnisse((e) => [...e, {id: frage.id, korrekt}]);
    speichereErgebnis(frage.id, korrekt);
  };

  const weiter = () => {
    setRunde((r) => ({...r, nr: r.nr + 1}));
    setAntwort(null);
    setGeprueft(false);
  };

  if (fertig) {
    const anzahlRichtig = ergebnisse.filter((e) => e.korrekt).length;
    const falscheIds = ergebnisse.filter((e) => !e.korrekt).map((e) => e.id);
    const falsche = fragen.filter((f) => falscheIds.includes(f.id));
    const prozent = ergebnisse.length ? Math.round((anzahlRichtig / ergebnisse.length) * 100) : 0;
    return (
      <section className={styles.quiz} aria-live="polite">
        <h3 className={styles.titel}>{titel}: Ergebnis</h3>
        <p className={styles.ergebnisZahl}>
          {anzahlRichtig} / {ergebnisse.length} richtig ({prozent} %)
        </p>
        <p>
          {prozent === 100
            ? 'Perfekt – alles richtig! 🎉'
            : prozent >= 70
              ? 'Gut gemacht! Schau dir die falschen Fragen noch einmal an.'
              : 'Lies die verlinkten Abschnitte nach und versuch es noch einmal.'}
        </p>
        <div className={styles.aktionen}>
          {falsche.length > 0 && (
            <button className={clsx(styles.knopf, styles.primaer)} onClick={() => starte(falsche)}>
              Falsche wiederholen ({falsche.length})
            </button>
          )}
          {onFertig ? (
            <button className={styles.knopf} onClick={onFertig}>
              Zur Übersicht
            </button>
          ) : (
            <button className={styles.knopf} onClick={() => starte(fragen)}>
              Neu starten
            </button>
          )}
        </div>
      </section>
    );
  }

  const {Ansicht, Loesung} = typ;
  const ziel = artikelZiel(frage, zeigeHerkunft);

  return (
    <section className={styles.quiz}>
      <div className={styles.kopf}>
        <h3 className={styles.titel}>{titel}</h3>
        <span className={styles.zaehler}>
          Frage {runde.nr + 1} / {runde.liste.length}
        </span>
      </div>
      <Fortschrittsbalken aktuell={runde.nr} gesamt={runde.liste.length} />

      {zeigeHerkunft && frage.lektion && (
        <p className={styles.herkunft}>
          {frage.bereich} · {frage.lektion}
        </p>
      )}
      <p className={styles.frage}>{frage.frage}</p>
      <p className={styles.hinweis}>{typ.hinweis(frage)}</p>

      <Ansicht frage={frage} antwort={aktuelleAntwort} setAntwort={setAntwort} geprueft={geprueft} />

      {geprueft && (
        <div className={clsx(styles.rueckmeldung, korrekt ? styles.rueckRichtig : styles.rueckFalsch)} aria-live="polite">
          <strong>{korrekt ? '✔ Richtig!' : '✘ Leider falsch.'}</strong>
          {!korrekt && Loesung && <Loesung frage={frage} />}
          {frage.erklaerung && <p>{frage.erklaerung}</p>}
          {ziel && (
            <Link to={ziel} className={styles.artikelLink}>
              📖 Im Artikel nachlesen
            </Link>
          )}
        </div>
      )}

      <div className={styles.aktionen}>
        {!geprueft ? (
          <button
            className={clsx(styles.knopf, styles.primaer)}
            disabled={!typ.beantwortet(frage, aktuelleAntwort)}
            onClick={pruefe}>
            Antwort prüfen
          </button>
        ) : (
          <button className={clsx(styles.knopf, styles.primaer)} onClick={weiter}>
            {runde.nr + 1 < runde.liste.length ? 'Weiter' : 'Ergebnis anzeigen'}
          </button>
        )}
      </div>
    </section>
  );
}
