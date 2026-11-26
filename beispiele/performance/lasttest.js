// Lasttest für den Mini-Shop mit k6 (https://k6.io) – JavaScript, ausgeführt von k6, nicht von Node.js.
//
// Aufruf (Mini-Shop läuft auf Port 5000):
//   k6 run lasttest.js                       # Rauchtest: 1 Nutzer, 10 Sekunden
//   k6 run -e PROFIL=last lasttest.js        # Lasttest: bis 20 gleichzeitige Nutzer
//   k6 run -e SHOP_URL=http://testserver:8080 lasttest.js
//
// Jeder virtuelle Nutzer (VU) spielt den typischen Einkauf durch: Produkte ansehen, Warenkorb anlegen,
// Artikel hinzufügen, Preis prüfen, bestellen. Die Schwellen (thresholds) machen aus dem Lasttest einen
// Test mit Ergebnis: Werden sie verletzt, endet k6 mit Exit-Code ungleich 0 – die CI wird rot.

import http from 'k6/http';
import {check, group, sleep} from 'k6';

const BASIS = __ENV.SHOP_URL || 'http://localhost:5000';
const JSON_KOPF = {headers: {'Content-Type': 'application/json'}};

const PROFILE = {
  // Rauchtest: Funktioniert das Skript überhaupt? Läuft bei jedem Push.
  rauch: {vus: 1, duration: '10s'},
  // Lasttest: hochfahren, halten, herunterfahren
  last: {
    stages: [
      {duration: '10s', target: 20},   // Rampe: in 10 s auf 20 gleichzeitige Nutzer
      {duration: '30s', target: 20},   // Plateau: 30 s lang halten
      {duration: '5s', target: 0},     // herunterfahren
    ],
  },
};

export const options = {
  ...PROFILE[__ENV.PROFIL || 'rauch'],
  thresholds: {
    http_req_failed: ['rate<0.01'],                         // weniger als 1 % fehlgeschlagene Anfragen
    http_req_duration: ['p(95)<300', 'p(99)<800'],          // 95 % unter 300 ms, 99 % unter 800 ms
    'http_req_duration{schritt:bestellen}': ['p(95)<500'],  // eigene Schwelle für den wichtigsten Schritt
    checks: ['rate>0.99'],                                  // fachliche Prüfungen zu über 99 % erfolgreich
  },
};

export default function einkauf() {
  group('Produkte ansehen', () => {
    const antwort = http.get(`${BASIS}/api/produkte`, {tags: {schritt: 'produkte'}});
    check(antwort, {
      'Produkte: Status 200': (r) => r.status === 200,
      'Produkte: Liste nicht leer': (r) => r.json().length > 0,
    });
  });
  sleep(1);   // Denkzeit: echte Nutzer klicken nicht im Millisekundentakt

  let warenkorbId;
  group('In den Warenkorb', () => {
    const neu = http.post(`${BASIS}/api/warenkoerbe`, null, {tags: {schritt: 'warenkorb'}});
    check(neu, {'Warenkorb: Status 201': (r) => r.status === 201});
    warenkorbId = neu.json('id');

    const position = http.post(
      `${BASIS}/api/warenkoerbe/${warenkorbId}/positionen`,
      JSON.stringify({produktId: 'buch', menge: 5}),   // 5 × 24,90 € = 124,50 € → 10 % Rabatt
      {...JSON_KOPF, tags: {schritt: 'position'}},
    );
    check(position, {
      'Position: Status 200': (r) => r.status === 200,
      'Position: Rabatt ab 100 €': (r) => r.json('endpreis') === 112.05,
    });
  });
  sleep(1);

  group('Bestellen', () => {
    const bestellung = http.post(
      `${BASIS}/api/warenkoerbe/${warenkorbId}/bestellung`,
      JSON.stringify({kundenName: `Lasttest ${__VU}-${__ITER}`, stammkunde: false}),
      {...JSON_KOPF, tags: {schritt: 'bestellen'}},
    );
    check(bestellung, {
      'Bestellung: Status 201': (r) => r.status === 201,
      'Bestellung: Nummer vorhanden': (r) => Boolean(r.json('bestellnummer')),
    });
  });
  sleep(1);
}
