/*
 * Eigene Fassung der Docusaurus-Komponente für Mermaid-Diagramme.
 *
 * Grund: Mit mehreren Diagrammen auf einer Seite verschwand gelegentlich ein bereits gezeichnetes
 * Diagramm wieder (Mermaid ist ein globales Objekt; parallele Aufrufe von initialize/render stören
 * sich). Hier werden alle Diagramme strikt NACHEINANDER gezeichnet, und das SVG wird über ein ref
 * gesetzt statt über dangerouslySetInnerHTML.
 */
import React, {useEffect, useRef, useState} from 'react';
import ErrorBoundary from '@docusaurus/ErrorBoundary';
import {ErrorBoundaryErrorMessageFallback} from '@docusaurus/theme-common';
import {MermaidContainerClassName, useMermaidConfig} from '@docusaurus/theme-mermaid/client';

let warteschlange = Promise.resolve();

function nacheinander(aufgabe) {
  const ergebnis = warteschlange.then(aufgabe, aufgabe);
  warteschlange = ergebnis.catch(() => {});
  return ergebnis;
}

let zaehler = 0;

async function zeichnen(text, config) {
  const {default: mermaid} = await import('mermaid');
  const id = `mermaid-svg-${Date.now()}-${++zaehler}`;
  mermaid.initialize(config);
  try {
    return await mermaid.render(id, text);
  } catch (fehler) {
    document.querySelector(`#d${id}`)?.remove();
    throw fehler;
  }
}

function MermaidRenderer({value}) {
  const config = useMermaidConfig();
  const ref = useRef(null);
  const [fehler, setFehler] = useState(null);

  useEffect(() => {
    let aktiv = true;
    nacheinander(() => zeichnen(value, config))
      .then((ergebnis) => {
        if (!aktiv || !ref.current) return;
        ref.current.innerHTML = ergebnis.svg;
        ergebnis.bindFunctions?.(ref.current);
      })
      .catch((e) => aktiv && setFehler(e));
    return () => {
      aktiv = false;
    };
  }, [value, config]);

  if (fehler) throw fehler;   // an die ErrorBoundary weiterreichen
  return <div ref={ref} className={MermaidContainerClassName} />;
}

export default function Mermaid(props) {
  return (
    <ErrorBoundary fallback={(params) => <ErrorBoundaryErrorMessageFallback {...params} />}>
      <MermaidRenderer {...props} />
    </ErrorBoundary>
  );
}
