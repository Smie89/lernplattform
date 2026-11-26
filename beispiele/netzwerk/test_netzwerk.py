"""Tests zu Subnetzen, TCP, UDP, DNS und HTTP – alles lokal, ohne Internet.

Aufruf:  python -m unittest -v
"""

import http.server
import json
import socket
import threading
import time
import unittest

from http_von_hand import anfrage_senden
from subnetz import aufteilen, im_selben_netz, netz_info


class SubnetzTests(unittest.TestCase):
    def test_netz_einer_adresse_mit_praefix_26(self):
        info = netz_info("192.168.10.37/26")
        self.assertEqual(info["netz"], "192.168.10.0/26")
        self.assertEqual(info["maske"], "255.255.255.192")
        self.assertEqual(info["broadcast"], "192.168.10.63")
        self.assertEqual((info["erster_host"], info["letzter_host"]), ("192.168.10.1", "192.168.10.62"))
        self.assertEqual(info["anzahl_hosts"], 62)   # 2^(32-26) - Netz- und Broadcastadresse

    def test_praefix_24_hat_254_hosts(self):
        self.assertEqual(netz_info("10.0.5.20/24")["anzahl_hosts"], 254)

    def test_grosses_netz_wird_berechnet_nicht_aufgezaehlt(self):
        self.assertEqual(netz_info("10.0.0.1/8")["anzahl_hosts"], 16_777_214)

    def test_einzelne_adresse_mit_praefix_32(self):
        self.assertEqual(netz_info("8.8.8.8/32")["anzahl_hosts"], 1)

    def test_private_und_oeffentliche_adressen(self):
        self.assertTrue(netz_info("10.1.2.3/8")["privat"])
        self.assertTrue(netz_info("172.16.0.1/12")["privat"])
        self.assertTrue(netz_info("192.168.1.1/24")["privat"])
        self.assertFalse(netz_info("8.8.8.8/32")["privat"])

    def test_gleiches_netz_haengt_vom_praefix_ab(self):
        self.assertTrue(im_selben_netz("192.168.10.37", "192.168.10.70", 24))
        self.assertFalse(im_selben_netz("192.168.10.37", "192.168.10.70", 26))   # .0–.63 vs. .64–.127

    def test_netz_in_vier_teilnetze_aufteilen(self):
        self.assertEqual(
            aufteilen("192.168.10.0/24", 26),
            ["192.168.10.0/26", "192.168.10.64/26", "192.168.10.128/26", "192.168.10.192/26"],
        )


class TestHandler(http.server.BaseHTTPRequestHandler):
    """Ein kleiner HTTP-Server für die Tests."""

    def do_GET(self):  # noqa: N802 – Name ist von http.server vorgegeben
        if self.path == "/api/status":
            body = json.dumps({"status": "ok"}).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        else:
            self.send_error(404)

    def log_message(self, *args):  # keine Ausgabe während der Tests
        pass


class HttpTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), TestHandler)   # Port 0 = freien wählen
        cls.port = cls.server.server_address[1]
        threading.Thread(target=cls.server.serve_forever, daemon=True).start()

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()

    def test_http_ist_text_ueber_tcp(self):
        status, header, body = anfrage_senden("127.0.0.1", self.port, "/api/status")
        self.assertEqual(status, 200)
        self.assertEqual(header["content-type"], "application/json")
        self.assertEqual(json.loads(body), {"status": "ok"})

    def test_unbekannter_pfad_liefert_404(self):
        status, _, _ = anfrage_senden("127.0.0.1", self.port, "/gibt-es-nicht")
        self.assertEqual(status, 404)


def freier_port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]   # danach ist der Port wieder frei – und niemand lauscht dort


class TcpUdpDnsTests(unittest.TestCase):
    def test_geschlossener_port_wird_sofort_abgelehnt(self):
        # "Connection refused": Rechner erreichbar, aber kein Dienst auf dem Port.
        # (Ein Timeout dagegen deutet auf Firewall oder nicht erreichbaren Rechner hin.)
        # Linux meldet das sofort; Windows wiederholt den Verbindungsaufbau und meldet erst nach ~2 s –
        # deshalb ist das Zeitlimit großzügig gewählt.
        start = time.perf_counter()
        with self.assertRaises(ConnectionRefusedError):
            socket.create_connection(("127.0.0.1", freier_port()), timeout=10)
        self.assertLess(time.perf_counter() - start, 5)

    def test_udp_braucht_keine_verbindung(self):
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as empfaenger, \
                socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sender:
            empfaenger.bind(("127.0.0.1", 0))
            empfaenger.settimeout(2)
            sender.sendto(b"hallo", empfaenger.getsockname())   # kein Handshake, einfach losschicken
            daten, _ = empfaenger.recvfrom(1024)
        self.assertEqual(daten, b"hallo")

    def test_localhost_wird_aufgeloest(self):
        adressen = {eintrag[4][0] for eintrag in socket.getaddrinfo("localhost", 80)}
        self.assertTrue(adressen & {"127.0.0.1", "::1"})


if __name__ == "__main__":
    unittest.main()
