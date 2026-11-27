import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import Quiz from '@site/src/components/Quiz';
import {mischen} from '@site/src/components/Quiz/typen';
import styles from './styles.module.css';

/*
 * Prüfungssimulation
 *
 * Verwendung in einer .mdx-Datei:
 *   import Pruefung from '@site/src/components/Pruefung';
 *   import pool from './pruefung-tae.yaml';
 *   <Pruefung pool={pool} />
 *
 * Der Pool (YAML) enthält name, dauer (Minuten), bestehen (Punkte), kapitel, lernziele und fragen –
 * siehe docs/11-istqb/pruefung-tae.yaml. Pro Prüfung werden je Lernziel "anzahl" Fragen zufällig gezogen.
 * Punkte je Frage: K2 = 1, K3 = 2, K4 = 3.
 *
 * Eine laufende Prüfung und die letzten Ergebnisse liegen im localStorage – ein Neuladen der Seite
 * (z. B. auf dem Handy) setzt die Prüfung mit der verbleibenden Zeit fort.
 */

const PUNKTE = {2: 1, 3: 2, 4: 3};
const VERLAUF_MAX = 20;
const MINUTE = 60 * 1000;

const speicherKey = (pool) => `lernplattform.pruefung.${pool.name}`;

function lade(pool) {
  try {
    return JSON.parse(window.localStorage.getItem(speicherKey(pool))) || {};
  } catch {
    return {};
  }
}

function speichere(pool, daten) {
  try {
    window.localStorage.setItem(speicherKey(pool), JSON.stringify(daten));
  } catch {
    // Speicher voll oder gesperrt – die Prüfung läuft trotzdem, nur ohne Fortsetzen nach Neuladen.
  }
}

/** "TAE-3.1.4" -> 3 */
const kapitelVon = (lz) => Number(String(lz).match(/-(\d+)\./)?.[1]);

function zeit(ms) {
  const sekunden = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(sekunden / 60);
  const s = String(sekunden % 60).padStart(2, '0');
  return `${m}:${s}`;
}

const gleich = (a = [], b = []) => a.length === b.length && a.every((x) => b.includes(x));

/** Zieht eine Prüfung nach der Verteilung der Lernziele. */
function zieheFragen(pool) {
  return pool.lernziele.flatMap((lz) => {
    const kandidaten = mischen(pool.fragen.filter((f) => f.lz === lz.id)).slice(0, lz.anzahl);
    return kandidaten.map((f) => ({id: f.id, reihenfolge: mischen(f.optionen.map((_, i) => i))}));
  });
}

function auswerten(pool, sitzung) {
  const fragenNachId = new Map(pool.fragen.map((f) => [f.id, f]));
  const lzNachId = new Map(pool.lernziele.map((l) => [l.id, l]));
  const kapitel = new Map(pool.kapitel.map((k) => [k.nr, {...k, fragen: 0, richtig: 0, punkte: 0, max: 0}]));
  const kStufen = new Map([2, 3, 4].map((k) => [k, {k, fragen: 0, richtig: 0, punkte: 0, max: 0}]));
  let punkte = 0;
  let max = 0;
  const einzeln = sitzung.fragen.map(({id, reihenfolge}, nr) => {
    const frage = fragenNachId.get(id);
    const lz = lzNachId.get(frage.lz);
    const wert = PUNKTE[lz.k];
    const antwort = sitzung.antworten[id] ?? [];
    const korrekt = gleich(antwort, frage.richtig);
    for (const gruppe of [kapitel.get(kapitelVon(lz.id)), kStufen.get(lz.k)]) {
      gruppe.fragen += 1;
      gruppe.max += wert;
      if (korrekt) {
        gruppe.richtig += 1;
        gruppe.punkte += wert;
      }
    }
    max += wert;
    if (korrekt) punkte += wert;
    return {nr, frage, lz, wert, antwort, korrekt, reihenfolge, markiert: sitzung.markiert.includes(id)};
  });
  return {
    punkte,
    max,
    bestanden: punkte >= pool.bestehen,
    richtig: einzeln.filter((e) => e.korrekt).length,
    einzeln,
    kapitel: [...kapitel.values()],
    kStufen: [...kStufen.values()],
  };
}

function Balken({wert, max}) {
  const prozent = max ? Math.round((wert / max) * 100) : 0;
  return (
    <span className={styles.balken} aria-hidden="true">
      <span className={clsx(styles.balkenFuellung, prozent < 65 && styles.balkenSchwach)} style={{width: `${prozent}%`}} />
    </span>
  );
}

// ---------------------------------------------------------------- Startseite

function Start({pool, gespeichert, onStart, onFortsetzen, onVerwerfen, onUeben}) {
  const [verlaengert, setVerlaengert] = useState(false);
  const laufend = gespeichert.laufend;
  const verlauf = gespeichert.verlauf ?? [];
  const anzahl = pool.lernziele.reduce((s, l) => s + l.anzahl, 0);
  const max = pool.lernziele.reduce((s, l) => s + l.anzahl * PUNKTE[l.k], 0);
  const dauer = verlaengert ? Math.round(pool.dauer * 1.25) : pool.dauer;

  return (
    <div className={styles.karte}>
      <h3 className={styles.titel}>🎓 Prüfungssimulation {pool.name}</h3>
      <ul className={styles.regeln}>
        <li>
          <strong>{anzahl} Fragen</strong>, zufällig gezogen nach der offiziellen Verteilung auf die Lernziele
        </li>
        <li>
          <strong>{max} Punkte</strong> – K2 = 1, K3 = 2, K4 = 3 Punkte; bestanden ab <strong>{pool.bestehen} Punkten</strong>
        </li>
        <li>
          <strong>{dauer} Minuten</strong>; danach wird automatisch abgegeben
        </li>
        <li>Fragen lassen sich markieren und später erneut ansehen; ausgewertet wird erst nach der Abgabe</li>
        <li>Bei „Wähle ZWEI“ zählt die Frage nur, wenn beide Antworten stimmen</li>
      </ul>

      {laufend ? (
        <div className={styles.hinweisKasten}>
          <p>
            Es läuft noch eine Prüfung: {Object.keys(laufend.antworten).length} von {laufend.fragen.length} Fragen
            beantwortet, noch {zeit(laufend.ende - Date.now())} Minuten.
          </p>
          <div className={styles.aktionen}>
            <button className={clsx(styles.knopf, styles.primaer)} onClick={onFortsetzen}>
              Fortsetzen
            </button>
            <button className={styles.knopf} onClick={onVerwerfen}>
              Verwerfen
            </button>
          </div>
        </div>
      ) : (
        <>
          <label className={styles.schalter}>
            <input type="checkbox" checked={verlaengert} onChange={(e) => setVerlaengert(e.target.checked)} />
            Prüfung nicht in der Muttersprache (+25 % Zeit, {Math.round(pool.dauer * 1.25)} Minuten)
          </label>
          <div className={styles.aktionen}>
            <button className={clsx(styles.knopf, styles.primaer)} onClick={() => onStart(dauer)}>
              Prüfung starten
            </button>
          </div>
        </>
      )}

      {verlauf.length > 0 && (
        <>
          <h4 className={styles.unterTitel}>Deine letzten Ergebnisse</h4>
          <div className={styles.tabelleRahmen}>
            <table className={styles.tabelle}>
              <thead>
                <tr>
                  <th>Datum</th>
                  <th>Punkte</th>
                  <th>Ergebnis</th>
                  <th>Zeit</th>
                </tr>
              </thead>
              <tbody>
                {verlauf.map((v) => (
                  <tr key={v.datum}>
                    <td>{new Date(v.datum).toLocaleDateString('de-DE', {day: '2-digit', month: '2-digit', year: 'numeric'})}</td>
                    <td>
                      {v.punkte} / {v.max} ({Math.round((v.punkte / v.max) * 100)} %)
                    </td>
                    <td>{v.bestanden ? '✔ bestanden' : '✘ nicht bestanden'}</td>
                    <td>{v.minuten} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <h4 className={styles.unterTitel}>Kapitel üben – ohne Zeitlimit, mit Lösung nach jeder Frage</h4>
      <div className={styles.kapitelListe}>
        {pool.kapitel.map((k) => {
          const n = pool.fragen.filter((f) => kapitelVon(f.lz) === k.nr).length;
          return (
            <button key={k.nr} className={styles.kapitelKnopf} onClick={() => onUeben(k)}>
              <strong>Kapitel {k.nr}</strong>
              <span>{k.titel}</span>
              <span className={styles.klein}>{n} Fragen</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Prüfung

function Frage({frage, lz, reihenfolge, antwort, setAntwort, nurAnsicht, zeigeLoesung}) {
  const benoetigt = frage.richtig.length;
  const mehrfach = frage.typ === 'multiple';
  const waehle = (i) => {
    if (nurAnsicht) return;
    if (!mehrfach) return setAntwort([i]);
    if (antwort.includes(i)) return setAntwort(antwort.filter((x) => x !== i));
    if (antwort.length >= benoetigt) return; // nicht mehr wählen als verlangt
    setAntwort([...antwort, i]);
  };
  return (
    <>
      <p className={styles.meta}>
        {lz.id} · K{lz.k} · {PUNKTE[lz.k]} {PUNKTE[lz.k] === 1 ? 'Punkt' : 'Punkte'}
      </p>
      <p className={styles.frage}>{frage.frage}</p>
      <p className={styles.hinweis}>{mehrfach ? `Wähle ${benoetigt === 2 ? 'ZWEI' : benoetigt} Antworten.` : 'Wähle EINE Antwort.'}</p>
      <div className={styles.optionen} role={mehrfach ? 'group' : 'radiogroup'}>
        {reihenfolge.map((original, pos) => {
          const gewaehlt = antwort.includes(original);
          const richtig = frage.richtig.includes(original);
          return (
            <button
              key={original}
              type="button"
              role={mehrfach ? 'checkbox' : 'radio'}
              aria-checked={gewaehlt}
              disabled={nurAnsicht}
              onClick={() => waehle(original)}
              className={clsx(
                styles.option,
                gewaehlt && styles.gewaehlt,
                zeigeLoesung && richtig && styles.richtig,
                zeigeLoesung && gewaehlt && !richtig && styles.falsch,
              )}>
              <span className={styles.buchstabe}>{String.fromCharCode(97 + pos)})</span>
              <span>{frage.optionen[original]}</span>
              {zeigeLoesung && (gewaehlt || richtig) && (
                <span className={styles.markierung}>{richtig ? (gewaehlt ? '✔ deine Wahl' : '✔ richtig') : '✘ deine Wahl'}</span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

function Durchfuehrung({pool, sitzung, setSitzung, onAbgeben}) {
  const [jetzt, setJetzt] = useState(() => Date.now());
  const [bestaetigen, setBestaetigen] = useState(false);
  const [uebersicht, setUebersicht] = useState(false);
  const oben = useRef(null);
  const fragenNachId = useMemo(() => new Map(pool.fragen.map((f) => [f.id, f])), [pool]);
  const lzNachId = useMemo(() => new Map(pool.lernziele.map((l) => [l.id, l])), [pool]);

  const rest = sitzung.ende - jetzt;
  useEffect(() => {
    oben.current?.scrollIntoView({block: 'start'}); // auf dem Handy direkt zur ersten Frage
  }, []);
  useEffect(() => {
    const timer = window.setInterval(() => setJetzt(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  useEffect(() => {
    if (rest <= 0) onAbgeben(true);
  }, [rest, onAbgeben]);

  const gehe = (nr) => {
    setSitzung((s) => ({...s, nr}));
    setUebersicht(false);
    setBestaetigen(false);
    oben.current?.scrollIntoView({block: 'start', behavior: 'smooth'});
  };

  const eintrag = sitzung.fragen[sitzung.nr];
  const frage = fragenNachId.get(eintrag.id);
  const lz = lzNachId.get(frage.lz);
  const antwort = sitzung.antworten[eintrag.id] ?? [];
  const markiert = sitzung.markiert.includes(eintrag.id);
  const beantwortet = sitzung.fragen.filter((f) => (sitzung.antworten[f.id] ?? []).length > 0).length;
  const offen = sitzung.fragen.length - beantwortet;

  const setAntwort = (neu) =>
    setSitzung((s) => {
      const antworten = {...s.antworten};
      if (neu.length) antworten[eintrag.id] = neu;
      else delete antworten[eintrag.id];
      return {...s, antworten};
    });
  const markieren = () =>
    setSitzung((s) => ({
      ...s,
      markiert: markiert ? s.markiert.filter((id) => id !== eintrag.id) : [...s.markiert, eintrag.id],
    }));

  return (
    <div className={styles.karte} ref={oben}>
      <div className={styles.leiste}>
        <span>
          Frage <strong>{sitzung.nr + 1}</strong> / {sitzung.fragen.length}
        </span>
        <span className={clsx(styles.uhr, rest < 10 * MINUTE && styles.uhrKnapp)} aria-label="Verbleibende Zeit">
          ⏱ {zeit(rest)}
        </span>
        <button className={styles.leistenKnopf} onClick={() => setUebersicht((u) => !u)} aria-expanded={uebersicht}>
          {uebersicht ? 'Zur Frage' : `Übersicht (${beantwortet}/${sitzung.fragen.length})`}
        </button>
      </div>

      {uebersicht ? (
        <>
          <p className={styles.hinweis}>Tippe auf eine Nummer, um zur Frage zu springen. ⚑ = markiert.</p>
          <div className={styles.raster}>
            {sitzung.fragen.map((f, nr) => (
              <button
                key={f.id}
                onClick={() => gehe(nr)}
                className={clsx(
                  styles.rasterFeld,
                  (sitzung.antworten[f.id] ?? []).length > 0 && styles.rasterBeantwortet,
                  nr === sitzung.nr && styles.rasterAktuell,
                )}
                aria-label={`Frage ${nr + 1}${sitzung.markiert.includes(f.id) ? ', markiert' : ''}`}>
                {nr + 1}
                {sitzung.markiert.includes(f.id) && <span className={styles.flagge}>⚑</span>}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <Frage frage={frage} lz={lz} reihenfolge={eintrag.reihenfolge} antwort={antwort} setAntwort={setAntwort} />
          <div className={styles.navigation}>
            <button className={styles.knopf} disabled={sitzung.nr === 0} onClick={() => gehe(sitzung.nr - 1)}>
              ← Zurück
            </button>
            <button className={clsx(styles.knopf, markiert && styles.markiertKnopf)} onClick={markieren} aria-pressed={markiert}>
              ⚑ {markiert ? 'Markiert' : 'Markieren'}
            </button>
            {sitzung.nr + 1 < sitzung.fragen.length ? (
              <button className={clsx(styles.knopf, styles.primaer)} onClick={() => gehe(sitzung.nr + 1)}>
                Weiter →
              </button>
            ) : (
              <button className={clsx(styles.knopf, styles.primaer)} onClick={() => setBestaetigen(true)}>
                Abgeben
              </button>
            )}
          </div>
        </>
      )}

      <div className={styles.abgabe}>
        {bestaetigen ? (
          <div className={styles.hinweisKasten}>
            <p>
              {offen > 0 ? `${offen} ${offen === 1 ? 'Frage ist' : 'Fragen sind'} noch unbeantwortet. ` : 'Alle Fragen sind beantwortet. '}
              {sitzung.markiert.length > 0 && `${sitzung.markiert.length} markiert. `}
              Jetzt abgeben?
            </p>
            <div className={styles.aktionen}>
              <button className={clsx(styles.knopf, styles.primaer)} onClick={() => onAbgeben(false)}>
                Ja, abgeben
              </button>
              <button className={styles.knopf} onClick={() => setBestaetigen(false)}>
                Weiter bearbeiten
              </button>
            </div>
          </div>
        ) : (
          <button className={styles.textKnopf} onClick={() => setBestaetigen(true)}>
            Prüfung abgeben …
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- Ergebnis

function Ergebnis({pool, sitzung, onNeu, onZurueck}) {
  const e = useMemo(() => auswerten(pool, sitzung), [pool, sitzung]);
  const [filter, setFilter] = useState('falsch');
  const prozent = Math.round((e.punkte / e.max) * 100);
  const minuten = Math.round(((sitzung.abgegeben ?? Date.now()) - sitzung.start) / MINUTE);
  const liste = e.einzeln.filter((x) => (filter === 'alle' ? true : filter === 'falsch' ? !x.korrekt : x.markiert));

  return (
    <div className={styles.karte}>
      <div className={clsx(styles.urteil, e.bestanden ? styles.urteilJa : styles.urteilNein)} aria-live="polite">
        <p className={styles.urteilText}>{e.bestanden ? '✔ Bestanden' : '✘ Nicht bestanden'}</p>
        <p className={styles.urteilZahl}>
          {e.punkte} / {e.max} Punkte ({prozent} %)
        </p>
        <p>
          {e.richtig} von {e.einzeln.length} Fragen richtig · benötigt: {pool.bestehen} Punkte · Zeit: {minuten} min
          {sitzung.zeitAbgelaufen && ' (Zeit abgelaufen)'}
        </p>
      </div>

      <h4 className={styles.unterTitel}>Nach Kapitel</h4>
      <table className={styles.tabelle}>
        <thead>
          <tr>
            <th>Kapitel</th>
            <th>Punkte</th>
            <th className={styles.balkenSpalte}>Anteil</th>
          </tr>
        </thead>
        <tbody>
          {e.kapitel.map((k) => (
            <tr key={k.nr}>
              <td>
                {k.nr}. {k.titel}
                <span className={styles.zusatz}>
                  {k.richtig} von {k.fragen} Fragen richtig
                </span>
              </td>
              <td className={styles.zahl}>
                {k.punkte}/{k.max}
              </td>
              <td className={styles.balkenSpalte}>
                <Balken wert={k.punkte} max={k.max} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h4 className={styles.unterTitel}>Nach K-Stufe</h4>
      <table className={styles.tabelle}>
        <tbody>
          {e.kStufen.map((k) => (
            <tr key={k.k}>
              <td>
                K{k.k} · {PUNKTE[k.k]} {PUNKTE[k.k] === 1 ? 'Punkt' : 'Punkte'} je Frage
                <span className={styles.zusatz}>
                  {k.richtig} von {k.fragen} Fragen richtig
                </span>
              </td>
              <td className={styles.zahl}>
                {k.punkte}/{k.max}
              </td>
              <td className={styles.balkenSpalte}>
                <Balken wert={k.punkte} max={k.max} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className={styles.aktionen}>
        <button className={clsx(styles.knopf, styles.primaer)} onClick={onNeu}>
          Neue Prüfung
        </button>
        <button className={styles.knopf} onClick={onZurueck}>
          Zur Übersicht
        </button>
      </div>

      <h4 className={styles.unterTitel}>Fragen durchgehen</h4>
      <div className={styles.filter} role="tablist">
        {[
          ['falsch', `Falsch (${e.einzeln.filter((x) => !x.korrekt).length})`],
          ['markiert', `Markiert (${e.einzeln.filter((x) => x.markiert).length})`],
          ['alle', `Alle (${e.einzeln.length})`],
        ].map(([wert, text]) => (
          <button
            key={wert}
            role="tab"
            aria-selected={filter === wert}
            className={clsx(styles.filterKnopf, filter === wert && styles.filterAktiv)}
            onClick={() => setFilter(wert)}>
            {text}
          </button>
        ))}
      </div>
      {liste.length === 0 && <p>Keine Fragen in dieser Auswahl.</p>}
      {liste.map((x) => (
        <div key={x.frage.id} className={clsx(styles.rueckblick, x.korrekt ? styles.rueckRichtig : styles.rueckFalsch)}>
          <p className={styles.rueckKopf}>
            <strong>
              Frage {x.nr + 1} {x.korrekt ? '✔' : '✘'}
            </strong>{' '}
            {x.korrekt ? `+${x.wert}` : `0 von ${x.wert}`} {x.wert === 1 ? 'Punkt' : 'Punkten'}
            {x.markiert && ' · ⚑ markiert'}
            {x.antwort.length === 0 && ' · nicht beantwortet'}
          </p>
          <Frage frage={x.frage} lz={x.lz} reihenfolge={x.reihenfolge} antwort={x.antwort} setAntwort={() => {}} nurAnsicht zeigeLoesung />
          <p className={styles.erklaerung}>{x.frage.erklaerung}</p>
          <p className={styles.klein}>
            Lernziel: {x.lz.titel} ·{' '}
            <Link to={x.frage.artikel ?? x.lz.artikel}>📖 Nachlesen</Link>
          </p>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------- Hauptkomponente

export default function Pruefung({pool}) {
  const [gespeichert, setGespeichert] = useState({}); // erst im Browser lesbar
  const [ansicht, setAnsicht] = useState('start'); // start | pruefung | ergebnis | ueben
  const [sitzung, setSitzung] = useState(null);
  const [uebung, setUebung] = useState(null);
  const aktuell = useRef(null);
  aktuell.current = sitzung;

  useEffect(() => {
    if (ansicht === 'start') setGespeichert(lade(pool));
  }, [pool, ansicht]);

  // Laufende Prüfung bei jeder Änderung sichern – so übersteht sie ein Neuladen der Seite.
  useEffect(() => {
    if (sitzung && !sitzung.abgegeben) speichere(pool, {...lade(pool), laufend: sitzung});
  }, [pool, sitzung]);

  const starten = (dauer) => {
    const start = Date.now();
    setSitzung({start, ende: start + dauer * MINUTE, fragen: zieheFragen(pool), antworten: {}, markiert: [], nr: 0});
    setAnsicht('pruefung');
  };

  // Eine abgelaufene Prüfung gibt die Durchführung sofort ab.
  const fortsetzen = () => {
    setSitzung(gespeichert.laufend);
    setAnsicht('pruefung');
  };

  const verwerfen = () => {
    const {laufend, ...rest} = lade(pool);
    speichere(pool, rest);
    setGespeichert(rest);
  };

  const abgeben = useCallback(
    (zeitAbgelaufen) => {
      const s = aktuell.current;
      if (!s || s.abgegeben) return;
      const fertig = {...s, abgegeben: Math.min(Date.now(), s.ende), zeitAbgelaufen};
      aktuell.current = fertig;
      const e = auswerten(pool, fertig);
      const eintrag = {
        datum: fertig.abgegeben,
        punkte: e.punkte,
        max: e.max,
        bestanden: e.bestanden,
        minuten: Math.round((fertig.abgegeben - fertig.start) / MINUTE),
      };
      const {laufend, verlauf = []} = lade(pool);
      speichere(pool, {verlauf: [eintrag, ...verlauf].slice(0, VERLAUF_MAX)});
      setSitzung(fertig);
      setAnsicht('ergebnis');
    },
    [pool],
  );

  const ueben = (kapitel) => {
    const lzNachId = new Map(pool.lernziele.map((l) => [l.id, l]));
    const fragen = pool.fragen
      .filter((f) => kapitelVon(f.lz) === kapitel.nr)
      .map((f) => ({...f, artikel: f.artikel ?? lzNachId.get(f.lz).artikel}));
    setUebung({kapitel, fragen});
    setAnsicht('ueben');
  };

  if (ansicht === 'pruefung' && sitzung) {
    return <Durchfuehrung pool={pool} sitzung={sitzung} setSitzung={setSitzung} onAbgeben={abgeben} />;
  }
  if (ansicht === 'ergebnis' && sitzung) {
    return (
      <Ergebnis
        pool={pool}
        sitzung={sitzung}
        onNeu={() => starten(Math.round((sitzung.ende - sitzung.start) / MINUTE))}
        onZurueck={() => setAnsicht('start')}
      />
    );
  }
  if (ansicht === 'ueben' && uebung) {
    return (
      <Quiz
        key={uebung.kapitel.nr}
        fragen={uebung.fragen}
        titel={`Kapitel ${uebung.kapitel.nr}: ${uebung.kapitel.titel}`}
        onFertig={() => setAnsicht('start')}
      />
    );
  }
  return (
    <Start
      pool={pool}
      gespeichert={gespeichert}
      onStart={starten}
      onFortsetzen={fortsetzen}
      onVerwerfen={verwerfen}
      onUeben={ueben}
    />
  );
}
