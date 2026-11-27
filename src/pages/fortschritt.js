import React, {useEffect, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import {dekodieren, kodieren, sammeln, zusammenfassen, zusammenfuehren} from '@site/src/lib/uebertragung.mjs';
import styles from './fortschritt.module.css';

function lokaleDaten() {
  try {
    return sammeln(window.localStorage);
  } catch {
    return null;   // Speicher gesperrt, z. B. im privaten Modus
  }
}

function zahlwort(n, eins, mehr) {
  return `${n} ${n === 1 ? eins : mehr}`;
}

export default function Fortschritt() {
  const [stand, setStand] = useState(null);   // erst im Browser lesbar
  const [code, setCode] = useState('');
  const [hinweis, setHinweis] = useState('');
  const [eingabe, setEingabe] = useState('');
  const [ergebnis, setErgebnis] = useState(null);   // {ok, text}
  const kannTeilen = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  useEffect(() => setStand(lokaleDaten()), []);
  const zahlen = stand ? zusammenfassen(stand.daten) : null;

  const codeErzeugen = async () => {
    const aktuell = lokaleDaten();
    setStand(aktuell);
    setCode(await kodieren(aktuell));
    setHinweis('');
  };

  const kopieren = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setHinweis('Kopiert. Jetzt auf dem anderen Gerät einfügen.');
    } catch {
      setHinweis('Kopieren nicht erlaubt – bitte den Code markieren und von Hand kopieren.');
    }
  };

  const teilen = async () => {
    try {
      await navigator.share({title: 'Lernfortschritt', text: code});
    } catch {
      // abgebrochen – nichts zu tun
    }
  };

  const dateiSpeichern = () => {
    const aktuell = lokaleDaten();
    const blob = new Blob([JSON.stringify(aktuell, null, 2)], {type: 'application/json'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `lernplattform-fortschritt-${aktuell.erstellt.slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const uebernehmen = async (text) => {
    setErgebnis(null);
    try {
      const fremd = await dekodieren(text);
      const lokal = lokaleDaten();
      const {daten, bericht} = zusammenfuehren(lokal.daten, fremd.daten);
      for (const [schluessel, wert] of Object.entries(daten)) {
        window.localStorage.setItem(schluessel, JSON.stringify(wert));
      }
      setStand(lokaleDaten());
      setEingabe('');
      const erstellt = new Date(fremd.erstellt).toLocaleString('de-DE', {dateStyle: 'medium', timeStyle: 'short'});
      setErgebnis({
        ok: true,
        text:
          `Übernommen (Stand vom ${erstellt}): ${zahlwort(bericht.fragenNeu, 'neue Frage', 'neue Fragen')}, ` +
          `${zahlwort(bericht.fragenAktualisiert, 'Frage', 'Fragen')} mit neuerem Stand aktualisiert, ` +
          `${zahlwort(bericht.pruefungenNeu, 'Prüfungsergebnis', 'Prüfungsergebnisse')} ergänzt.`,
      });
    } catch (fehler) {
      setErgebnis({ok: false, text: fehler.message || 'Übernehmen fehlgeschlagen.'});
    }
  };

  const dateiLaden = async (ereignis) => {
    const datei = ereignis.target.files?.[0];
    if (datei) await uebernehmen(await datei.text());
    ereignis.target.value = '';
  };

  return (
    <Layout title="Fortschritt übertragen" description="Lernfortschritt zwischen Handy und PC übertragen – ohne Konto">
      <main className={`container margin-vert--lg ${styles.seite}`}>
        <h1>💾 Fortschritt übertragen</h1>
        <p>
          Dein Lernfortschritt – Wiederholungsplan und Prüfungsergebnisse – liegt nur in diesem Browser. So bringst du ihn
          auf ein anderes Gerät: hier einen <strong>Code erzeugen</strong>, ihn kopieren oder teilen (z. B. per Messenger
          oder E-Mail an dich selbst) und auf dem anderen Gerät unten <strong>einfügen</strong>.
        </p>
        <p className={styles.klein}>
          Beim Übernehmen wird <strong>zusammengeführt</strong>, nicht überschrieben: Pro Frage gilt der zuletzt beantwortete
          Stand, Prüfungsergebnisse beider Geräte bleiben erhalten. Du kannst also in beide Richtungen übertragen.
        </p>

        {stand === null ? (
          <p className={styles.fehler}>Dieser Browser erlaubt keinen Zugriff auf den lokalen Speicher (privater Modus?).</p>
        ) : (
          <>
            <section className={styles.karte}>
              <h2>Von diesem Gerät</h2>
              <p>
                {zahlen
                  ? `${zahlwort(zahlen.fragen, 'Frage', 'Fragen')} beantwortet, ${zahlwort(zahlen.pruefungen, 'Prüfungsergebnis', 'Prüfungsergebnisse')}.`
                  : 'Wird geladen …'}
              </p>
              <div className={styles.aktionen}>
                <button className={clsx(styles.knopf, styles.primaer)} onClick={codeErzeugen}>
                  Code erzeugen
                </button>
                <button className={styles.knopf} onClick={dateiSpeichern}>
                  Als Datei speichern
                </button>
              </div>
              {code && (
                <>
                  <textarea
                    className={styles.feld}
                    readOnly
                    value={code}
                    aria-label="Code zum Übertragen"
                    onFocus={(e) => e.target.select()}
                    rows={4}
                  />
                  <p className={styles.klein}>{code.length.toLocaleString('de-DE')} Zeichen</p>
                  <div className={styles.aktionen}>
                    <button className={clsx(styles.knopf, styles.primaer)} onClick={kopieren}>
                      Kopieren
                    </button>
                    {kannTeilen && (
                      <button className={styles.knopf} onClick={teilen}>
                        Teilen …
                      </button>
                    )}
                  </div>
                  {hinweis && <p role="status">{hinweis}</p>}
                </>
              )}
            </section>

            <section className={styles.karte}>
              <h2>Auf dieses Gerät</h2>
              <textarea
                className={styles.feld}
                value={eingabe}
                onChange={(e) => setEingabe(e.target.value)}
                placeholder="Code hier einfügen (beginnt mit LP1:)"
                aria-label="Code einfügen"
                rows={4}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
              />
              <div className={styles.aktionen}>
                <button
                  className={clsx(styles.knopf, styles.primaer)}
                  disabled={!eingabe.trim()}
                  onClick={() => uebernehmen(eingabe)}>
                  Übernehmen
                </button>
                <label className={styles.knopf}>
                  Datei laden …
                  <input type="file" accept=".json,application/json" onChange={dateiLaden} className={styles.unsichtbar} />
                </label>
              </div>
              {ergebnis && (
                <p role="status" className={ergebnis.ok ? styles.erfolg : styles.fehler}>
                  {ergebnis.ok ? '✔ ' : '✘ '}
                  {ergebnis.text}
                </p>
              )}
            </section>

            <p>
              <Link to="/wiederholen">🔁 Zum Wiederholen</Link>
            </p>
          </>
        )}
      </main>
    </Layout>
  );
}
