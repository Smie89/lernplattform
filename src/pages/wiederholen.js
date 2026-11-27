import React, {useEffect, useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import Quiz from '@site/src/components/Quiz';
import {ladeFortschritt, istFaellig, plan} from '@site/src/components/Quiz/fortschritt';
import quizStyles from '@site/src/components/Quiz/styles.module.css';
import styles from './wiederholen.module.css';

// Alle Fragen aller Lektionen – der fragen-loader ergänzt Lektion, Bereich und Seite.
const kontext = require.context('../../docs', true, /\.fragen\.yaml$/);
const ALLE_FRAGEN = (() => {
  const gesehen = new Map();
  for (const schluessel of kontext.keys()) {
    for (const frage of kontext(schluessel).default) gesehen.set(frage.id, frage);
  }
  return [...gesehen.values()];
})();
const BEREICHE = [...new Set(ALLE_FRAGEN.map((f) => f.bereich))];
const RUNDENGROESSE = 20;

function zufaellig(liste, anzahl) {
  const kopie = [...liste];
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  }
  return kopie.slice(0, anzahl);
}

function Kennzahl({wert, text}) {
  return (
    <div className={styles.kennzahl}>
      <span className={styles.kennzahlWert}>{wert}</span>
      <span className={styles.kennzahlText}>{text}</span>
    </div>
  );
}

export default function Wiederholen() {
  const [fortschritt, setFortschritt] = useState(null); // erst im Browser lesbar
  const [bereich, setBereich] = useState('');
  const [runde, setRunde] = useState(null); // {titel, fragen}

  useEffect(() => {
    if (!runde) setFortschritt(ladeFortschritt());
  }, [runde]);

  const zahlen = useMemo(() => {
    if (!fortschritt) return null;
    const imBereich = ALLE_FRAGEN.filter((f) => !bereich || f.bereich === bereich);
    const jetzt = new Date();
    const faellig = imBereich.filter((f) => istFaellig(fortschritt[f.id], jetzt));
    const falsch = imBereich.filter((f) => fortschritt[f.id] && !fortschritt[f.id].zuletztRichtig);
    const neu = imBereich.filter((f) => !fortschritt[f.id]);
    const sicher = imBereich.filter((f) => (plan(fortschritt[f.id])?.stufe ?? 0) >= 3);
    return {imBereich, faellig, falsch, neu, sicher};
  }, [fortschritt, bereich]);

  const starte = (titel, fragen) => {
    setRunde({titel, fragen});
    window.scrollTo({top: 0});
  };

  return (
    <Layout title="Wiederholen" description="Fällige Fragen aus allen Lektionen wiederholen">
      <main className={clsx('container', 'margin-vert--lg', styles.seite)}>
        <h1>🔁 Wiederholen</h1>

        {runde ? (
          <Quiz
            key={runde.titel + runde.fragen.length}
            fragen={runde.fragen}
            titel={runde.titel}
            zeigeHerkunft
            onFertig={() => setRunde(null)}
          />
        ) : (
          <>
            <p>
              Fragen, die du falsch beantwortet hast, kommen sofort wieder. Richtig beantwortete kommen nach 1, 3, 7, 14, 30
              und 60 Tagen erneut – je sicherer du bist, desto seltener. Dein Stand wird nur in diesem Browser gespeichert.
            </p>

            <label className={styles.filter}>
              Bereich:{' '}
              <select className={quizStyles.auswahlfeld} value={bereich} onChange={(e) => setBereich(e.target.value)}>
                <option value="">Alle Bereiche</option>
                {BEREICHE.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>

            {!zahlen ? (
              <p>Lade deinen Lernstand …</p>
            ) : (
              <>
                <div className={styles.kennzahlen}>
                  <Kennzahl wert={zahlen.faellig.length} text="heute fällig" />
                  <Kennzahl wert={zahlen.sicher.length} text="sicher (3× in Folge richtig)" />
                  <Kennzahl wert={zahlen.imBereich.length - zahlen.neu.length} text="schon beantwortet" />
                  <Kennzahl wert={zahlen.imBereich.length} text="Fragen insgesamt" />
                </div>

                <div className={quizStyles.aktionen}>
                  <button
                    className={clsx(quizStyles.knopf, quizStyles.primaer)}
                    disabled={zahlen.faellig.length === 0}
                    onClick={() => starte('Fällige Fragen', zufaellig(zahlen.faellig, RUNDENGROESSE))}>
                    Fällige wiederholen ({Math.min(zahlen.faellig.length, RUNDENGROESSE)})
                  </button>
                  <button
                    className={quizStyles.knopf}
                    disabled={zahlen.falsch.length === 0}
                    onClick={() => starte('Zuletzt falsch', zufaellig(zahlen.falsch, RUNDENGROESSE))}>
                    Zuletzt falsch ({Math.min(zahlen.falsch.length, RUNDENGROESSE)})
                  </button>
                  <button
                    className={quizStyles.knopf}
                    disabled={zahlen.neu.length === 0}
                    onClick={() => starte('Neue Fragen', zufaellig(zahlen.neu, 10))}>
                    10 neue Fragen
                  </button>
                  <button
                    className={quizStyles.knopf}
                    onClick={() => starte('Zufallsmix', zufaellig(zahlen.imBereich, RUNDENGROESSE))}>
                    Zufallsmix ({RUNDENGROESSE})
                  </button>
                </div>

                {zahlen.faellig.length === 0 && (
                  <p className={styles.hinweis}>
                    Heute ist nichts fällig. 🎉 Beantworte Quizfragen in den Lektionen oder probiere „10 neue Fragen“.
                  </p>
                )}

                <p className={styles.hinweis}>
                  Lernst du auf Handy und PC? <Link to="/fortschritt">💾 Fortschritt übertragen</Link>
                </p>
              </>
            )}
          </>
        )}
      </main>
    </Layout>
  );
}
