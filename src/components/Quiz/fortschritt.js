/*
 * Lernfortschritt im localStorage – mit Wiederholungsplan (Leitner-System).
 *
 * Pro Frage: {richtig, falsch, zuletzt, zuletztRichtig, stufe, faellig}
 *   - falsch beantwortet  -> stufe 0, sofort wieder fällig
 *   - richtig beantwortet -> stufe + 1, fällig nach 1, 3, 7, 14, 30, 60 Tagen
 * Je öfter eine Frage hintereinander sitzt, desto seltener kommt sie wieder.
 */

export const SPEICHER_KEY = 'lernplattform.fortschritt.v1';
const INTERVALLE_TAGE = [1, 3, 7, 14, 30, 60];
const TAG = 24 * 60 * 60 * 1000;

function tagesbeginn(datum) {
  const d = new Date(datum);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function ladeFortschritt() {
  try {
    return JSON.parse(window.localStorage.getItem(SPEICHER_KEY)) || {};
  } catch {
    return {};
  }
}

/** Ältere Einträge (vor dem Wiederholungsplan) bekommen Stufe und Fälligkeit nachträglich. */
export function plan(eintrag) {
  if (!eintrag) return null;
  if (eintrag.faellig) return eintrag;
  const stufe = eintrag.zuletztRichtig ? 1 : 0;
  const faellig = eintrag.zuletztRichtig
    ? new Date(tagesbeginn(eintrag.zuletzt).getTime() + INTERVALLE_TAGE[0] * TAG).toISOString()
    : eintrag.zuletzt;
  return {...eintrag, stufe, faellig};
}

export function istFaellig(eintrag, jetzt = new Date()) {
  const p = plan(eintrag);
  return Boolean(p) && new Date(p.faellig) <= jetzt;
}

export function speichereErgebnis(id, korrekt) {
  try {
    const daten = ladeFortschritt();
    const eintrag = plan(daten[id]) || {richtig: 0, falsch: 0, stufe: 0};
    const jetzt = new Date();
    if (korrekt) {
      eintrag.richtig += 1;
      eintrag.stufe = Math.min((eintrag.stufe || 0) + 1, INTERVALLE_TAGE.length);
      const tage = INTERVALLE_TAGE[eintrag.stufe - 1];
      eintrag.faellig = new Date(tagesbeginn(jetzt).getTime() + tage * TAG).toISOString();
    } else {
      eintrag.falsch += 1;
      eintrag.stufe = 0;
      eintrag.faellig = jetzt.toISOString();
    }
    eintrag.zuletzt = jetzt.toISOString();
    eintrag.zuletztRichtig = korrekt;
    daten[id] = eintrag;
    window.localStorage.setItem(SPEICHER_KEY, JSON.stringify(daten));
  } catch {
    // Speicher nicht verfügbar (z. B. privater Modus) – Quiz funktioniert trotzdem.
  }
}
