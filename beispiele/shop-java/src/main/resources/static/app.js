// Einfache Oberfläche ohne Framework: spricht nur mit der REST-API unter /api.
const euro = (betrag) => betrag.toFixed(2).replace('.', ',') + ' €';
const $ = (id) => document.getElementById(id);

let warenkorbId = null;

async function api(methode, pfad, body) {
  const antwort = await fetch('/api' + pfad, {
    method: methode,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const daten = antwort.status === 204 ? null : await antwort.json();
  if (!antwort.ok) throw new Error(daten?.detail ?? 'Unbekannter Fehler');
  return daten;
}

function zeigeFehler(text) {
  $('fehler').textContent = text;
  $('fehler').hidden = !text;
}

function zeigeWarenkorb(w) {
  const tbody = $('positionen').querySelector('tbody');
  tbody.innerHTML = '';
  for (const p of w.positionen) {
    const zeile = document.createElement('tr');
    zeile.dataset.testid = 'position-' + p.produktId;
    zeile.innerHTML = `<td>${p.name}</td><td data-testid="menge">${p.menge}</td><td>${euro(p.summe)}</td>`;
    const zelle = document.createElement('td');
    const entfernen = document.createElement('button');
    entfernen.textContent = 'Entfernen';
    entfernen.setAttribute('aria-label', p.name + ' entfernen');
    entfernen.onclick = () => aktion(() => api('DELETE', `/warenkoerbe/${warenkorbId}/positionen/${p.produktId}`));
    zelle.append(entfernen);
    zeile.append(zelle);
    tbody.append(zeile);
  }
  $('positionen').hidden = w.positionen.length === 0;
  $('leer').hidden = w.positionen.length > 0;
  document.querySelector('[data-testid=zwischensumme]').textContent = euro(w.zwischensumme);
  document.querySelector('[data-testid=rabatt]').textContent = Math.round(w.rabattSatz * 100) + ' %';
  document.querySelector('[data-testid=endpreis] strong').textContent = euro(w.endpreis);
}

async function aktualisiere() {
  const stammkunde = $('stammkunde').checked;
  zeigeWarenkorb(await api('GET', `/warenkoerbe/${warenkorbId}?stammkunde=${stammkunde}`));
}

async function aktion(schritt) {
  zeigeFehler('');
  try {
    await schritt();
    await aktualisiere();
  } catch (e) {
    zeigeFehler(e.message);
  }
}

async function neuerWarenkorb() {
  warenkorbId = (await api('POST', '/warenkoerbe')).id;
  await aktualisiere();
}

async function start() {
  const produkte = await api('GET', '/produkte');
  for (const p of produkte) {
    const li = document.createElement('li');
    li.dataset.testid = 'produkt-' + p.id;
    li.innerHTML = `<span class="name">${p.name}</span><span class="preis">${euro(p.preis)}</span>`;
    const knopf = document.createElement('button');
    knopf.textContent = 'In den Warenkorb';
    knopf.onclick = () => aktion(() =>
      api('POST', `/warenkoerbe/${warenkorbId}/positionen`, { produktId: p.id, menge: 1 }));
    li.append(knopf);
    $('produkte').append(li);
  }

  $('stammkunde').onchange = () => aktion(async () => {});

  $('bestellformular').onsubmit = async (e) => {
    e.preventDefault();
    zeigeFehler('');
    $('bestaetigung').hidden = true;
    try {
      const b = await api('POST', `/warenkoerbe/${warenkorbId}/bestellung`, {
        kundenName: $('kundenname').value,
        stammkunde: $('stammkunde').checked,
      });
      $('bestaetigung').textContent =
        `Vielen Dank, ${b.kundenName}! Bestellung ${b.bestellnummer} über ${euro(b.endpreis)} ist eingegangen.`;
      $('bestaetigung').hidden = false;
      await neuerWarenkorb();
    } catch (err) {
      zeigeFehler(err.message);
    }
  };

  await neuerWarenkorb();
  document.body.dataset.bereit = 'true';   // Signal für Tests: Seite ist vollständig geladen
}

start();
