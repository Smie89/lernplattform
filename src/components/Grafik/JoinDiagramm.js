import React from 'react';
import styles from './styles.module.css';

/*
 * Mengendiagramme für SQL-JOINs: welche Zeilen landen im Ergebnis?
 * Farben über CSS-Variablen, damit es im hellen und dunklen Design funktioniert.
 *
 * Verwendung in MDX:  <JoinDiagramm />
 */

const ARTEN = [
  {
    name: 'INNER JOIN',
    bereich: 'schnitt',
    text: 'nur Zeilen mit Partner auf beiden Seiten',
    beispiel: 'Anna, Ben, Clara – David fehlt',
  },
  {
    name: 'LEFT JOIN',
    bereich: 'links',
    text: 'alle Zeilen links, rechts NULL ohne Partner',
    beispiel: 'Anna, Ben, Clara und David (mit NULL)',
  },
  {
    name: 'RIGHT JOIN',
    bereich: 'rechts',
    text: 'alle Zeilen rechts, links NULL ohne Partner',
    beispiel: 'alle Bestellungen – David fehlt, er hat keine',
  },
  {
    name: 'FULL OUTER JOIN',
    bereich: 'alles',
    text: 'alle Zeilen beider Seiten',
    beispiel: 'alle Kunden und alle Bestellungen',
  },
];

function Venn({bereich, id}) {
  // Zwei Kreise: links "kunden", rechts "bestellungen". Gefüllt wird je nach JOIN-Art.
  const links = bereich === 'links' || bereich === 'alles';
  const rechts = bereich === 'rechts' || bereich === 'alles';
  return (
    <svg viewBox="0 0 200 120" className={styles.venn} role="img" aria-labelledby={`${id}-titel`}>
      <title id={`${id}-titel`}>{`Mengendiagramm: kunden links, bestellungen rechts`}</title>
      <defs>
        <clipPath id={`${id}-links`}>
          <circle cx="78" cy="58" r="46" />
        </clipPath>
      </defs>
      {/* Deckkraft auf der Gruppe: Überlappende Flächen werden nicht doppelt dunkel */}
      <g className={styles.flaeche}>
        {links && <circle cx="78" cy="58" r="46" className={styles.gefuellt} />}
        {rechts && <circle cx="122" cy="58" r="46" className={styles.gefuellt} />}
        {/* Schnittmenge immer gefüllt: Sie gehört zu jedem JOIN */}
        <circle cx="122" cy="58" r="46" clipPath={`url(#${id}-links)`} className={styles.gefuellt} />
      </g>
      <circle cx="78" cy="58" r="46" className={styles.rand} />
      <circle cx="122" cy="58" r="46" className={styles.rand} />
      <text x="48" y="112" className={styles.beschriftung} textAnchor="middle">kunden</text>
      <text x="152" y="112" className={styles.beschriftung} textAnchor="middle">bestellungen</text>
    </svg>
  );
}

export default function JoinDiagramm() {
  return (
    <figure className={styles.abbildung}>
      <div className={styles.raster}>
        {ARTEN.map((art, i) => (
          <div key={art.name} className={styles.karte}>
            <strong className={styles.titel}>{art.name}</strong>
            <Venn bereich={art.bereich} id={`join-${i}`} />
            <span className={styles.text}>{art.text}</span>
            <span className={styles.beispiel}>{art.beispiel}</span>
          </div>
        ))}
      </div>
      <figcaption className={styles.unterschrift}>
        Gefüllt ist, was im Ergebnis landet. Beispiel: kunden LEFT JOIN bestellungen – David hat nie bestellt.
      </figcaption>
    </figure>
  );
}
