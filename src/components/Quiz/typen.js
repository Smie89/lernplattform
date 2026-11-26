import React from 'react';
import clsx from 'clsx';
import {Highlight} from 'prism-react-renderer';
import {usePrismTheme} from '@docusaurus/theme-common';
import styles from './styles.module.css';

/*
 * Fragetypen. Jeder Typ besteht aus:
 *   vorbereiten(frage, mischen) – einmal pro Runde (z. B. Optionen mischen)
 *   leer                        – Anfangswert der Antwort
 *   beantwortet(frage, antwort) – darf "Antwort prüfen" gedrückt werden?
 *   korrekt(frage, antwort)
 *   hinweis(frage)              – kurze Anleitung unter der Frage
 *   Ansicht                     – React-Komponente
 */

export function mischen(liste) {
  const kopie = [...liste];
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  }
  return kopie;
}

// ---------- single / multiple / wahr-falsch ----------

const auswahl = {
  vorbereiten(frage, mischenErlaubt) {
    const texte = frage.typ === 'wahr-falsch' ? ['Wahr', 'Falsch'] : frage.optionen || [];
    const optionen = texte.map((text, index) => ({text: String(text), richtig: (frage.richtig || []).includes(index)}));
    return {...frage, optionen: frage.typ === 'wahr-falsch' || !mischenErlaubt ? optionen : mischen(optionen)};
  },
  leer: [],
  beantwortet: (frage, antwort) => antwort.length > 0,
  korrekt: (frage, antwort) => frage.optionen.every((opt, i) => opt.richtig === antwort.includes(i)),
  hinweis: (frage) => (frage.typ === 'multiple' ? 'Mehrere Antworten können richtig sein.' : 'Eine Antwort ist richtig.'),
  Ansicht({frage, antwort, setAntwort, geprueft}) {
    const mehrfach = frage.typ === 'multiple';
    const waehle = (i) =>
      setAntwort(mehrfach ? (antwort.includes(i) ? antwort.filter((x) => x !== i) : [...antwort, i]) : [i]);
    return (
      <div className={styles.optionen} role={mehrfach ? 'group' : 'radiogroup'}>
        {frage.optionen.map((opt, i) => {
          const gewaehlt = antwort.includes(i);
          return (
            <button
              key={i}
              type="button"
              role={mehrfach ? 'checkbox' : 'radio'}
              aria-checked={gewaehlt}
              disabled={geprueft}
              onClick={() => waehle(i)}
              className={clsx(
                styles.option,
                gewaehlt && styles.gewaehlt,
                geprueft && opt.richtig && styles.richtig,
                geprueft && gewaehlt && !opt.richtig && styles.falsch,
              )}>
              <span className={styles.marker}>{mehrfach ? (gewaehlt ? '☑' : '☐') : gewaehlt ? '●' : '○'}</span>
              <span>{opt.text}</span>
            </button>
          );
        })}
      </div>
    );
  },
};

// ---------- fehler-finden: Zeile(n) im Code antippen ----------

const fehlerFinden = {
  vorbereiten: (frage) => ({...frage, code: String(frage.code).replace(/\n+$/, '')}),
  leer: [],
  beantwortet: (frage, antwort) => antwort.length > 0,
  korrekt: (frage, antwort) =>
    antwort.length === frage.richtig.length && frage.richtig.every((z) => antwort.includes(z)),
  hinweis: (frage) =>
    frage.richtig.length > 1
      ? `Tippe auf die ${frage.richtig.length} betroffenen Zeilen.`
      : 'Tippe auf die betroffene Zeile.',
  Ansicht({frage, antwort, setAntwort, geprueft}) {
    const theme = usePrismTheme();
    const mehrere = frage.richtig.length > 1;
    const waehle = (i) =>
      setAntwort(mehrere ? (antwort.includes(i) ? antwort.filter((x) => x !== i) : [...antwort, i]) : [i]);
    return (
      <Highlight theme={theme} code={frage.code} language={frage.sprache || 'text'}>
        {({tokens, getTokenProps, style}) => (
          <div className={styles.code} style={style} role="group" aria-label="Code, Zeilen antippbar">
            {tokens.map((zeile, i) => {
              const gewaehlt = antwort.includes(i);
              const richtig = frage.richtig.includes(i);
              return (
                <button
                  key={i}
                  type="button"
                  aria-pressed={gewaehlt}
                  disabled={geprueft}
                  onClick={() => waehle(i)}
                  className={clsx(
                    styles.codeZeile,
                    gewaehlt && styles.zeileGewaehlt,
                    geprueft && richtig && styles.zeileRichtig,
                    geprueft && gewaehlt && !richtig && styles.zeileFalsch,
                  )}>
                  <span className={styles.zeilenNr}>{i + 1}</span>
                  <span className={styles.zeilenText}>
                    {zeile.length === 1 && zeile[0].empty ? ' ' : zeile.map((token, k) => <span key={k} {...getTokenProps({token})} />)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </Highlight>
    );
  },
};

// ---------- reihenfolge: Einträge nacheinander antippen ----------

const reihenfolge = {
  vorbereiten(frage, mischenErlaubt) {
    const pool = (frage.elemente || []).map((text, pos) => ({text: String(text), pos}));
    return {...frage, pool: mischenErlaubt ? mischen(pool) : pool};
  },
  leer: [],
  beantwortet: (frage, antwort) => antwort.length === frage.pool.length,
  korrekt: (frage, antwort) => antwort.every((poolIndex, platz) => frage.pool[poolIndex].pos === platz),
  hinweis: () => 'Tippe die Einträge in der richtigen Reihenfolge an. Ein Tipp auf einen gewählten Eintrag nimmt ihn zurück.',
  Ansicht({frage, antwort, setAntwort, geprueft}) {
    const frei = frage.pool.map((_, i) => i).filter((i) => !antwort.includes(i));
    return (
      <>
        <ol className={styles.reihe}>
          {antwort.map((poolIndex, platz) => {
            const eintrag = frage.pool[poolIndex];
            const ok = eintrag.pos === platz;
            return (
              <li key={poolIndex}>
                <button
                  type="button"
                  disabled={geprueft}
                  onClick={() => setAntwort(antwort.filter((x) => x !== poolIndex))}
                  className={clsx(styles.option, styles.gewaehlt, geprueft && (ok ? styles.richtig : styles.falsch))}>
                  <span className={styles.marker}>{platz + 1}.</span>
                  <span className={styles.wachsen}>{eintrag.text}</span>
                  {!geprueft && <span className={styles.zuruecknehmen} aria-label="zurücknehmen">↩</span>}
                </button>
              </li>
            );
          })}
          {antwort.length === 0 && <li className={styles.platzhalter}>Noch nichts gewählt – tippe unten den ersten Eintrag an.</li>}
        </ol>
        {frei.length > 0 && (
          <div className={styles.optionen}>
            {frei.map((i) => (
              <button key={i} type="button" className={clsx(styles.option, styles.poolEintrag)} onClick={() => setAntwort([...antwort, i])}>
                <span className={styles.marker}>＋</span>
                <span>{frage.pool[i].text}</span>
              </button>
            ))}
          </div>
        )}
      </>
    );
  },
  Loesung: ({frage}) => (
    <>
      <p>Richtige Reihenfolge:</p>
      <ol>
        {frage.elemente.map((text, i) => (
          <li key={i}>{String(text)}</li>
        ))}
      </ol>
    </>
  ),
};

// ---------- zuordnen: zu jedem Eintrag das Gegenstück wählen ----------

const zuordnen = {
  vorbereiten(frage, mischenErlaubt) {
    const zeilen = (frage.paare || []).map(([links, rechts]) => ({links: String(links), rechts: String(rechts)}));
    const rechts = zeilen.map((z) => z.rechts);
    return {
      ...frage,
      zeilen: mischenErlaubt ? mischen(zeilen) : zeilen,
      auswahlRechts: mischenErlaubt ? mischen(rechts) : [...rechts].sort((a, b) => a.localeCompare(b, 'de')),
    };
  },
  leer: {},
  beantwortet: (frage, antwort) => frage.zeilen.every((_, i) => antwort[i]),
  korrekt: (frage, antwort) => frage.zeilen.every((z, i) => antwort[i] === z.rechts),
  hinweis: () => 'Wähle zu jedem Eintrag das passende Gegenstück.',
  Ansicht({frage, antwort, setAntwort, geprueft}) {
    return (
      <div className={styles.optionen}>
        {frage.zeilen.map((zeile, i) => {
          const ok = antwort[i] === zeile.rechts;
          return (
            <div
              key={zeile.links}
              className={clsx(styles.paar, antwort[i] && styles.gewaehlt, geprueft && (ok ? styles.richtig : styles.falsch))}>
              <label className={styles.paarLinks} htmlFor={`${frage.id}-${i}`}>
                {zeile.links}
              </label>
              <select
                id={`${frage.id}-${i}`}
                className={styles.auswahlfeld}
                value={antwort[i] ?? ''}
                disabled={geprueft}
                onChange={(e) => setAntwort({...antwort, [i]: e.target.value})}>
                <option value="" disabled>
                  – bitte wählen –
                </option>
                {frage.auswahlRechts.map((text) => (
                  <option key={text} value={text}>
                    {text}
                  </option>
                ))}
              </select>
              {geprueft && !ok && <span className={styles.korrektur}>richtig: {zeile.rechts}</span>}
            </div>
          );
        })}
      </div>
    );
  },
};

// ---------- lueckentext: Lücken (___) ausfüllen ----------

function normalisiere(text, exakt) {
  const t = String(text).trim().replace(/\s+/g, ' ');
  return exakt ? t : t.toLowerCase();
}

const lueckentext = {
  vorbereiten: (frage) => ({
    ...frage,
    teile: String(frage.text).replace(/\n+$/, '').split('___'),
    luecken: (frage.luecken || []).map((erlaubt) => (Array.isArray(erlaubt) ? erlaubt : [erlaubt]).map(String)),
  }),
  leer: [],
  beantwortet: (frage, antwort) => frage.luecken.every((_, i) => (antwort[i] || '').trim() !== ''),
  korrekt: (frage, antwort) =>
    frage.luecken.every((erlaubt, i) =>
      erlaubt.some((e) => normalisiere(e, frage.exakt) === normalisiere(antwort[i] || '', frage.exakt)),
    ),
  hinweis: (frage) =>
    `Fülle ${frage.luecken.length > 1 ? 'die Lücken' : 'die Lücke'} aus.${frage.exakt ? ' Groß- und Kleinschreibung zählt.' : ''}`,
  Ansicht({frage, antwort, setAntwort, geprueft}) {
    return (
      <div className={clsx(styles.lueckentext, frage.sprache && styles.lueckentextCode)}>
        {frage.teile.map((teil, i) => {
          if (i === frage.teile.length - 1) return <span key={i}>{teil}</span>;
          const erlaubt = frage.luecken[i];
          const ok = erlaubt.some((e) => normalisiere(e, frage.exakt) === normalisiere(antwort[i] || '', frage.exakt));
          const breite = Math.min(Math.max(4, ...erlaubt.map((e) => e.length)) + 2, 22);
          return (
            <React.Fragment key={i}>
              {teil}
              <input
                type="text"
                aria-label={`Lücke ${i + 1}`}
                className={clsx(styles.luecke, geprueft && (ok ? styles.lueckeRichtig : styles.lueckeFalsch))}
                style={{width: `${breite}ch`}}
                value={antwort[i] ?? ''}
                disabled={geprueft}
                autoCapitalize="off"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                onChange={(e) => {
                  const neu = [...antwort];
                  neu[i] = e.target.value;
                  setAntwort(neu);
                }}
              />
              {geprueft && !ok && <span className={styles.korrektur}> → {erlaubt[0]}</span>}
            </React.Fragment>
          );
        })}
      </div>
    );
  },
};

export const TYPEN = {
  single: auswahl,
  multiple: auswahl,
  'wahr-falsch': auswahl,
  'fehler-finden': fehlerFinden,
  reihenfolge,
  zuordnen,
  lueckentext,
};

export function typVon(frage) {
  return TYPEN[frage.typ] || auswahl;
}
