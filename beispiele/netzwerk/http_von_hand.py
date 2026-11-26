"""HTTP ohne Bibliothek: eine Anfrage als Text über eine TCP-Verbindung schicken.

Zeigt, dass HTTP/1.1 nur strukturierter Text über TCP ist – genau das, was Browser,
curl und REST Assured im Hintergrund tun.

Aufruf:  python http_von_hand.py example.org 80 /
"""

import socket
import sys


def anfrage_senden(host, port, pfad="/", zeitlimit=5):
    """Schickt GET <pfad> und liefert (statuscode, header-dict, body-text)."""
    anfrage = (
        f"GET {pfad} HTTP/1.1\r\n"
        f"Host: {host}\r\n"
        "User-Agent: lernplattform-beispiel\r\n"
        "Connection: close\r\n"          # Server schließt nach der Antwort – einfacher zu lesen
        "\r\n"                            # Leerzeile = Ende der Header
    )
    with socket.create_connection((host, port), timeout=zeitlimit) as verbindung:   # TCP-Handshake
        verbindung.sendall(anfrage.encode("ascii"))
        teile = []
        while daten := verbindung.recv(4096):
            teile.append(daten)
    roh = b"".join(teile).decode("utf-8", errors="replace")
    kopf, _, body = roh.partition("\r\n\r\n")
    statuszeile, *headerzeilen = kopf.split("\r\n")
    version, status, *_ = statuszeile.split(" ", 2)
    header = {}
    for zeile in headerzeilen:
        name, _, wert = zeile.partition(":")
        header[name.strip().lower()] = wert.strip()
    return int(status), header, body


if __name__ == "__main__":
    host = sys.argv[1] if len(sys.argv) > 1 else "localhost"
    port = int(sys.argv[2]) if len(sys.argv) > 2 else 5000
    pfad = sys.argv[3] if len(sys.argv) > 3 else "/"
    status, header, body = anfrage_senden(host, port, pfad)
    print("Status:", status)
    for name, wert in header.items():
        print(f"{name}: {wert}")
    print(f"\n{body[:300]}")
