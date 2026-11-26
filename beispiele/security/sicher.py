"""Sichere Varianten der Funktionen aus unsicher.py (gleiche Namen, gleiche Aufrufe)."""

import hashlib
import hmac
import html
import secrets
from pathlib import Path

# scrypt ist absichtlich langsam und speicherintensiv (hier 16 MiB pro Berechnung).
# Alternativen in anderen Sprachen: Argon2id (empfohlen), bcrypt, PBKDF2 mit vielen Iterationen.
SCRYPT = {"n": 2**14, "r": 8, "p": 1}


def passwort_hashen(passwort):
    salt = secrets.token_bytes(16)  # zufällig, für jedes Passwort neu
    wert = hashlib.scrypt(passwort.encode(), salt=salt, **SCRYPT)
    return f"scrypt${salt.hex()}${wert.hex()}"  # Verfahren und Salt werden mitgespeichert


def passwort_pruefen(passwort, gespeichert):
    verfahren, salt_hex, hash_hex = gespeichert.split("$")
    if verfahren != "scrypt":
        return False
    wert = hashlib.scrypt(passwort.encode(), salt=bytes.fromhex(salt_hex), **SCRYPT)
    # Vergleich in konstanter Zeit: verrät nicht über die Laufzeit, wie viele Zeichen stimmen.
    return hmac.compare_digest(wert.hex(), hash_hex)


_DUMMY_HASH = passwort_hashen(secrets.token_hex(16))


def anmelden(db, name, passwort):
    # Parametrisierte Abfrage: Die Eingabe ist immer nur ein Wert, nie Teil des SQL-Befehls.
    zeile = db.execute(
        "SELECT name, passwort_hash FROM benutzer WHERE name = ?", (name,)
    ).fetchone()
    if zeile is None:
        # Trotzdem einmal rechnen, damit die Antwortzeit nicht verrät, ob es den Namen gibt.
        passwort_pruefen(passwort, _DUMMY_HASH)
        return None
    return zeile[0] if passwort_pruefen(passwort, zeile[1]) else None


def kommentar_html(autor, text):
    # Ausgabe kontextgerecht kodieren: < > & " ' werden zu HTML-Entities.
    return f"<p><b>{html.escape(autor)}</b>: {html.escape(text)}</p>"


def datei_lesen(basis, dateiname):
    basis = Path(basis).resolve()
    ziel = (basis / dateiname).resolve()  # löst "../" und symbolische Links auf
    if not ziel.is_relative_to(basis):
        raise PermissionError(f"Zugriff außerhalb von {basis} verweigert: {dateiname}")
    return ziel.read_text(encoding="utf-8")


def bestellung_holen(db, angemeldet, bestell_id):
    # Autorisierung in der Abfrage: nur eigene Bestellungen. Fremde und nicht vorhandene
    # Bestellungen sehen gleich aus (None) – das verrät nicht, welche IDs existieren.
    return db.execute(
        "SELECT id, besitzer, artikel FROM bestellungen WHERE id = ? AND besitzer = ?",
        (bestell_id, angemeldet),
    ).fetchone()
