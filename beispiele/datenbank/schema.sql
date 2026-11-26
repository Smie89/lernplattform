-- Schema des Mini-Shops (SQLite). Gleiche Fachlichkeit wie beispiele/shop.
PRAGMA foreign_keys = ON;   -- SQLite prüft Fremdschlüssel nur mit dieser Einstellung

CREATE TABLE kunden (
    id          INTEGER PRIMARY KEY,
    name        TEXT    NOT NULL,
    email       TEXT    NOT NULL UNIQUE,
    stammkunde  INTEGER NOT NULL DEFAULT 0 CHECK (stammkunde IN (0, 1))
);

CREATE TABLE produkte (
    id          TEXT    PRIMARY KEY,
    name        TEXT    NOT NULL,
    kategorie   TEXT    NOT NULL,
    preis       NUMERIC NOT NULL CHECK (preis > 0),
    bestand     INTEGER NOT NULL DEFAULT 0 CHECK (bestand >= 0)
);

CREATE TABLE bestellungen (
    id          INTEGER PRIMARY KEY,
    kunde_id    INTEGER NOT NULL REFERENCES kunden (id),
    datum       TEXT    NOT NULL,              -- ISO 8601: 2026-11-26
    status      TEXT    NOT NULL CHECK (status IN ('offen', 'bezahlt', 'versendet', 'storniert'))
);

CREATE TABLE positionen (
    bestellung_id INTEGER NOT NULL REFERENCES bestellungen (id),
    produkt_id    TEXT    NOT NULL REFERENCES produkte (id),
    menge         INTEGER NOT NULL CHECK (menge > 0),
    einzelpreis   NUMERIC NOT NULL,           -- Preis zum Bestellzeitpunkt
    PRIMARY KEY (bestellung_id, produkt_id)
);

CREATE INDEX idx_bestellungen_kunde ON bestellungen (kunde_id);
