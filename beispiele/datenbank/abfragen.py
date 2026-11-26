"""Die Abfragen aus den Lektionen – als Konstanten, damit Tests sie prüfen können."""

# Lektion 1: einfache Abfragen
TECHNIK_NACH_PREIS = """
SELECT name, preis
FROM produkte
WHERE kategorie = 'Technik'
ORDER BY preis DESC
"""

# Lektion 2: JOIN
POSITIONEN_MIT_PRODUKT = """
SELECT b.id AS bestellung, p.name AS produkt, pos.menge, pos.menge * pos.einzelpreis AS summe
FROM bestellungen AS b
JOIN positionen AS pos ON pos.bestellung_id = b.id
JOIN produkte   AS p   ON p.id = pos.produkt_id
WHERE b.id = ?
ORDER BY p.name
"""

# LEFT JOIN: auch Kunden ohne Bestellung erscheinen
BESTELLUNGEN_PRO_KUNDE = """
SELECT k.name, COUNT(b.id) AS anzahl
FROM kunden AS k
LEFT JOIN bestellungen AS b ON b.kunde_id = k.id
GROUP BY k.id, k.name
ORDER BY anzahl DESC, k.name
"""

# Aggregation mit Filter vor (WHERE) und nach (HAVING) dem Gruppieren
UMSATZ_PRO_KUNDE = """
SELECT k.name, ROUND(SUM(pos.menge * pos.einzelpreis), 2) AS umsatz
FROM kunden AS k
JOIN bestellungen AS b   ON b.kunde_id = k.id
JOIN positionen   AS pos ON pos.bestellung_id = b.id
WHERE b.status <> 'storniert'
GROUP BY k.id, k.name
HAVING SUM(pos.menge * pos.einzelpreis) > 50
ORDER BY umsatz DESC
"""

# Unterabfrage: Produkte, die noch nie bestellt wurden
NIE_BESTELLT = """
SELECT name
FROM produkte
WHERE id NOT IN (SELECT produkt_id FROM positionen)
"""

# Typischer Fehler: COUNT(*) zählt bei LEFT JOIN auch die NULL-Zeile mit
BESTELLUNGEN_PRO_KUNDE_FALSCH = BESTELLUNGEN_PRO_KUNDE.replace("COUNT(b.id)", "COUNT(*)")
