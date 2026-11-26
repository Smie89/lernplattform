"""Tests für den Header-Check – mit festen Header-Beispielen, ohne Netzwerk."""

import unittest

from header_check import befunde

# So antwortete der Mini-Shop vor der Behebung (gemessen mit header_check.py)
VORHER = {"content-type": "text/html", "server": "Kestrel"}

# Nach der Behebung in Program.cs
NACHHER = {
    "content-type": "text/html",
    "content-security-policy": "default-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "no-referrer",
}


def texte(liste):
    return " | ".join(text for _, text in liste)


class HeaderCheckTests(unittest.TestCase):
    def test_mini_shop_vorher_hat_vier_echte_befunde(self):
        ergebnis = befunde("http://localhost:5000/", VORHER)
        schwer = [s for s, _ in ergebnis if s in ("mittel", "niedrig")]
        self.assertEqual(len(schwer), 4)
        self.assertIn("Content-Security-Policy fehlt", texte(ergebnis))
        self.assertIn("Clickjacking", texte(ergebnis))
        self.assertIn("server: Kestrel", texte(ergebnis))

    def test_mini_shop_nachher_nur_hinweis_auf_fehlendes_tls(self):
        ergebnis = befunde("http://localhost:5000/", NACHHER)
        self.assertEqual([s for s, _ in ergebnis], ["info"])

    def test_https_ohne_hsts_ist_ein_befund(self):
        self.assertIn("HSTS", texte(befunde("https://shop.example.org/", NACHHER)))

    def test_unsafe_inline_wird_gemeldet(self):
        header = {**NACHHER, "content-security-policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; frame-ancestors 'none'"}
        self.assertIn("unsafe-inline", texte(befunde("http://localhost/", header)))

    def test_cookie_ohne_schutzattribute(self):
        header = {**NACHHER, "strict-transport-security": "max-age=31536000", "set-cookie": "sitzung=abc123; Path=/"}
        ergebnis = texte(befunde("https://shop.example.org/", header))
        for erwartet in ("ohne HttpOnly", "ohne SameSite", "ohne Secure"):
            with self.subTest(erwartet=erwartet):
                self.assertIn(erwartet, ergebnis)

    def test_sicheres_cookie_ohne_befund(self):
        header = {**NACHHER, "strict-transport-security": "max-age=31536000",
                  "set-cookie": "sitzung=abc123; Path=/; Secure; HttpOnly; SameSite=Lax"}
        self.assertEqual(befunde("https://shop.example.org/", header), [])

    def test_schwerste_befunde_zuerst(self):
        ergebnis = befunde("http://localhost/", VORHER)
        self.assertEqual(ergebnis[0][0], "mittel")
        self.assertEqual(ergebnis[-1][0], "info")


if __name__ == "__main__":
    unittest.main()
