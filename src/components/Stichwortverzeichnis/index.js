import React, {useMemo, useState} from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

/** Erster Buchstabe für die Gruppierung – Umlaute zu ihrem Grundbuchstaben, Ziffern und Zeichen unter "#". */
function buchstabe(begriff) {
  const b = begriff.charAt(0).toUpperCase().replace('Ä', 'A').replace('Ö', 'O').replace('Ü', 'U');
  return /[A-Z]/.test(b) ? b : '#';
}

export default function Stichwortverzeichnis({eintraege}) {
  const [filter, setFilter] = useState('');

  const gruppen = useMemo(() => {
    const suche = filter.trim().toLowerCase();
    const treffer = suche
      ? eintraege.filter((e) => e.begriff.toLowerCase().includes(suche))
      : eintraege;
    const map = new Map();
    for (const e of treffer) {
      const b = buchstabe(e.begriff);
      if (!map.has(b)) map.set(b, []);
      map.get(b).push(e);
    }
    return [...map.entries()];
  }, [eintraege, filter]);

  const anzahl = gruppen.reduce((summe, [, liste]) => summe + liste.length, 0);

  return (
    <Layout title="Stichwortverzeichnis" description="Alle Themen der Lernplattform von A bis Z">
      <main className={`container margin-vert--lg ${styles.seite}`}>
        <h1>📇 Stichwortverzeichnis</h1>
        <p>
          Alle Lektionen und Abschnitte von A bis Z. Für die Suche im gesamten Text gibt es zusätzlich die Suche oben
          rechts.
        </p>

        <input
          type="search"
          className={styles.filter}
          placeholder="Filtern, z. B. JOIN, TLS, Flaky …"
          aria-label="Stichwörter filtern"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <p className={styles.anzahl}>{anzahl} Einträge</p>

        {!filter && (
          <nav className={styles.alphabet} aria-label="Buchstaben">
            {gruppen.map(([b]) => (
              <a key={b} href={`#buchstabe-${b}`}>
                {b}
              </a>
            ))}
          </nav>
        )}

        {gruppen.map(([b, liste]) => (
          <section key={b} className={styles.gruppe}>
            <h2 id={`buchstabe-${b}`} className={styles.buchstabe}>
              {b}
            </h2>
            <ul className={styles.liste}>
              {liste.map((e) => (
                <li key={e.link}>
                  <Link to={e.link} className={e.art === 'lektion' ? styles.lektion : undefined}>
                    {e.begriff}
                  </Link>
                  <span className={styles.herkunft}>
                    {e.art === 'lektion' ? e.bereich : `${e.bereich} · ${e.lektion}`}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {anzahl === 0 && <p>Nichts gefunden. Versuche die Volltextsuche oben rechts.</p>}
      </main>
    </Layout>
  );
}
