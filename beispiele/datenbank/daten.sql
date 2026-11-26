-- Testdaten (erfunden). Bewusst mit Sonderfällen: Kunde ohne Bestellung, stornierte Bestellung,
-- Produkt, das nie bestellt wurde, Produkt ohne Bestand.
INSERT INTO kunden (id, name, email, stammkunde) VALUES
    (1, 'Anna Berg',   'anna@example.org',  1),
    (2, 'Ben Kraus',   'ben@example.org',   0),
    (3, 'Clara Wolf',  'clara@example.org', 0),
    (4, 'David Sommer','david@example.org', 1);   -- hat nie bestellt

INSERT INTO produkte (id, name, kategorie, preis, bestand) VALUES
    ('buch',    'Fachbuch Testautomation', 'Bücher',  39.90, 25),
    ('monitor', 'Monitor 27 Zoll',         'Technik', 249.00, 4),
    ('kabel',   'HDMI-Kabel',              'Technik',   9.90, 100),
    ('tasse',   'Tasse „Grün ist gut“',    'Küche',    12.50, 0),   -- ausverkauft
    ('maus',    'Funkmaus',                'Technik',  24.90, 30);  -- nie bestellt

INSERT INTO bestellungen (id, kunde_id, datum, status) VALUES
    (1, 1, '2026-11-02', 'versendet'),
    (2, 1, '2026-11-20', 'bezahlt'),
    (3, 2, '2026-11-21', 'offen'),
    (4, 3, '2026-11-22', 'storniert');

INSERT INTO positionen (bestellung_id, produkt_id, menge, einzelpreis) VALUES
    (1, 'monitor', 1, 249.00),
    (1, 'kabel',   2,   9.90),
    (2, 'buch',    1,  39.90),
    (3, 'buch',    2,  39.90),
    (3, 'tasse',   1,  12.50),
    (4, 'kabel',   1,   9.90);
