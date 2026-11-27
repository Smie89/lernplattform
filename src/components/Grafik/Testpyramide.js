import React from 'react';
import styles from './styles.module.css';

/*
 * Die Testpyramide als SVG: unten viele schnelle Tests, oben wenige langsame.
 * Verwendung in MDX:  <Testpyramide />
 */

const EBENEN = [
  {name: 'UI / E2E', hinweis: 'wenige · langsam · teuer', farbe: 'var(--ifm-color-primary-darkest)'},
  {name: 'Integration / API', hinweis: 'einige · mittel', farbe: 'var(--ifm-color-primary-darker)'},
  {name: 'Unit-Tests', hinweis: 'viele · schnell · billig', farbe: 'var(--ifm-color-primary)'},
];

export default function Testpyramide() {
  const breite = 320;
  const hoehe = 210;
  const ebenenHoehe = hoehe / EBENEN.length;
  return (
    <figure className={styles.abbildung}>
      <svg viewBox={`0 0 ${breite} ${hoehe + 10}`} className={styles.pyramide} role="img" aria-labelledby="pyramide-titel">
        <title id="pyramide-titel">Testpyramide: oben wenige UI-Tests, in der Mitte API-Tests, unten viele Unit-Tests</title>
        {EBENEN.map((ebene, i) => {
          // Trapez je Ebene: oben schmaler, unten breiter
          const y1 = i * ebenenHoehe;
          const y2 = y1 + ebenenHoehe;
          const halb = (y) => 24 + (y / hoehe) * (breite / 2 - 24);   // oben abgeflacht, damit Text passt
          const mitte = breite / 2;
          const punkte = [
            [mitte - halb(y1), y1 + 4],
            [mitte + halb(y1), y1 + 4],
            [mitte + halb(y2), y2],
            [mitte - halb(y2), y2],
          ]
            .map((p) => p.join(','))
            .join(' ');
          return (
            <g key={ebene.name}>
              <polygon points={punkte} className={styles.ebene} style={{fill: ebene.farbe}} />
              <text x={mitte} y={y1 + ebenenHoehe * 0.62} textAnchor="middle" className={styles.ebenenName}>
                {ebene.name}
              </text>
              {i > 0 && (
                <text x={mitte} y={y1 + ebenenHoehe * 0.88} textAnchor="middle" className={styles.ebenenHinweis}>
                  {ebene.hinweis}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <figcaption className={styles.unterschrift}>
        Oben: {EBENEN[0].hinweis}. Nach unten werden die Tests zahlreicher, schneller und stabiler.
      </figcaption>
    </figure>
  );
}
