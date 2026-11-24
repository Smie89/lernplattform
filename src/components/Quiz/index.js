import React, {useEffect, useMemo, useState, useCallback} from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import styles from './styles.module.css';

/*
 * Quiz-Komponente
 *
 * Verwendung in einer .mdx-Datei:
 *   import Quiz from '@site/src/components/Quiz';
 *   import fragen from './meine-lektion.fragen.yaml';
 *   <Quiz fragen={fragen} titel="Quiz: Meine Lektion" />
 *
 * Format einer Frage (YAML):
 *   - id: eindeutige-id
 *     typ: single | multiple | wahr-falsch
 *     frage: "Fragetext"
 *     optionen: ["A", "B", "C"]      (bei wahr-falsch weglassen)
 *     richtig: [1]                   (Index ab 0; bei wahr-falsch: [0]=wahr, [1]=falsch)
 *     erklaerung: "Warum ..."
 *     artikel: "#anker" oder "/lernen/pfad#anker"
 *     schwierigkeit: 1-3
 *     tags: [ ... ]
 */

const SPEICHER_KEY = 'lernplattform.fortschritt.v1';

function ladeFortschritt() {
  try {
    return JSON.parse(window.localStorage.getItem(SPEICHER_KEY)) || {};
  } catch {
    return {};
  }
}

function speichereErgebnis(id, korrekt) {
  try {
    const daten = ladeFortschritt();
    const eintrag = daten[id] || {richtig: 0, falsch: 0};
    if (korrekt) eintrag.richtig += 1;
    else eintrag.falsch += 1;
    eintrag.zuletzt = new Date().toISOString();
    eintrag.zuletztRichtig = korrekt;
    daten[id] = eintrag;
    window.localStorage.setItem(SPEICHER_KEY, JSON.stringify(daten));
  } catch {
    // Speicher nicht verfügbar (z. B. privater Modus) – Quiz funktioniert trotzdem.
  }
}

function mischen(liste) {
  const kopie = [...liste];
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  }
  return kopie;
}

/** Bereitet eine Frage auf: Optionen mischen, richtige Indizes mitführen. */
function bereiteVor(frage, optionenMischen = true) {
  const optionen =
    frage.typ === 'wahr-falsch' ? ['Wahr', 'Falsch'] : frage.optionen || [];
  const indiziert = optionen.map((text, index) => ({
    text,
    richtig: (frage.richtig || []).includes(index),
  }));
  return {
    ...frage,
    mehrfach: frage.typ === 'multiple',
    optionen: frage.typ === 'wahr-falsch' || !optionenMischen ? indiziert : mischen(indiziert),
  };
}

function Fortschrittsbalken({aktuell, gesamt}) {
  const prozent = Math.round((aktuell / gesamt) * 100);
  return (
    <div className={styles.balken} aria-hidden="true">
      <div className={styles.balkenFuellung} style={{width: `${prozent}%`}} />
    </div>
  );
}

export default function Quiz({fragen = [], titel = 'Quiz', mischeFragen = true}) {
  // Erst ungemischt rendern (identisch zum vorgerenderten HTML),
  // dann im Browser mischen – sonst gibt es einen Hydration-Fehler.
  const [runde, setRunde] = useState(() => ({
    liste: fragen.map((f) => bereiteVor(f, false)),
    nr: 0,
  }));
  useEffect(() => {
    setRunde({liste: (mischeFragen ? mischen(fragen) : fragen).map(bereiteVor), nr: 0});
  }, [fragen, mischeFragen]);
  const [auswahl, setAuswahl] = useState([]);
  const [geprueft, setGeprueft] = useState(false);
  const [ergebnisse, setErgebnisse] = useState([]); // {id, korrekt}

  const frage = runde.liste[runde.nr];
  const fertig = runde.nr >= runde.liste.length;

  const korrekt = useMemo(() => {
    if (!frage) return false;
    return frage.optionen.every((opt, i) => opt.richtig === auswahl.includes(i));
  }, [frage, auswahl]);

  const starte = useCallback((liste) => {
    setRunde({liste: mischen(liste).map(bereiteVor), nr: 0});
    setAuswahl([]);
    setGeprueft(false);
    setErgebnisse([]);
  }, []);

  if (fragen.length === 0) {
    return <div className={styles.quiz}>Für diese Lektion gibt es noch keine Fragen.</div>;
  }

  const waehle = (index) => {
    if (geprueft) return;
    if (frage.mehrfach) {
      setAuswahl((a) => (a.includes(index) ? a.filter((x) => x !== index) : [...a, index]));
    } else {
      setAuswahl([index]);
    }
  };

  const pruefe = () => {
    setGeprueft(true);
    setErgebnisse((e) => [...e, {id: frage.id, korrekt}]);
    speichereErgebnis(frage.id, korrekt);
  };

  const weiter = () => {
    setRunde((r) => ({...r, nr: r.nr + 1}));
    setAuswahl([]);
    setGeprueft(false);
  };

  if (fertig) {
    const anzahlRichtig = ergebnisse.filter((e) => e.korrekt).length;
    const falscheIds = ergebnisse.filter((e) => !e.korrekt).map((e) => e.id);
    const falsche = fragen.filter((f) => falscheIds.includes(f.id));
    const prozent = Math.round((anzahlRichtig / ergebnisse.length) * 100);
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
          <button className={styles.knopf} onClick={() => starte(fragen)}>
            Neu starten
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.quiz}>
      <div className={styles.kopf}>
        <h3 className={styles.titel}>{titel}</h3>
        <span className={styles.zaehler}>
          Frage {runde.nr + 1} / {runde.liste.length}
        </span>
      </div>
      <Fortschrittsbalken aktuell={runde.nr} gesamt={runde.liste.length} />

      <p className={styles.frage}>{frage.frage}</p>
      <p className={styles.hinweis}>
        {frage.mehrfach ? 'Mehrere Antworten können richtig sein.' : 'Eine Antwort ist richtig.'}
      </p>

      <div className={styles.optionen} role={frage.mehrfach ? 'group' : 'radiogroup'}>
        {frage.optionen.map((opt, i) => {
          const gewaehlt = auswahl.includes(i);
          return (
            <button
              key={i}
              type="button"
              role={frage.mehrfach ? 'checkbox' : 'radio'}
              aria-checked={gewaehlt}
              disabled={geprueft}
              onClick={() => waehle(i)}
              className={clsx(
                styles.option,
                gewaehlt && styles.gewaehlt,
                geprueft && opt.richtig && styles.richtig,
                geprueft && gewaehlt && !opt.richtig && styles.falsch,
              )}>
              <span className={styles.marker}>{frage.mehrfach ? (gewaehlt ? '☑' : '☐') : gewaehlt ? '●' : '○'}</span>
              <span>{opt.text}</span>
            </button>
          );
        })}
      </div>

      {geprueft && (
        <div
          className={clsx(styles.rueckmeldung, korrekt ? styles.rueckRichtig : styles.rueckFalsch)}
          aria-live="polite">
          <strong>{korrekt ? '✔ Richtig!' : '✘ Leider falsch.'}</strong>
          {frage.erklaerung && <p>{frage.erklaerung}</p>}
          {frage.artikel && (
            <Link to={frage.artikel} className={styles.artikelLink}>
              📖 Im Artikel nachlesen
            </Link>
          )}
        </div>
      )}

      <div className={styles.aktionen}>
        {!geprueft ? (
          <button
            className={clsx(styles.knopf, styles.primaer)}
            disabled={auswahl.length === 0}
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
