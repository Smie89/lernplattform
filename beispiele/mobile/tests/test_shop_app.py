"""Ende-zu-Ende-Tests der Mini-Shop-App mit Appium (UiAutomator2)."""
import re

from screens import ShopScreen


def test_alle_produkte_werden_angezeigt(driver):
    assert len(ShopScreen(driver).produktzeilen()) == 5


def test_rabatt_ab_100_euro(driver):
    shop = ShopScreen(driver).hinzufuegen("Rucksack", 2)   # 99,80 €
    assert shop.rabatt == "Rabatt: 0 %"
    assert shop.endpreis == "Endpreis: 99,80 €"
    shop.hinzufuegen("Tasse")                              # 112,30 €
    assert shop.rabatt == "Rabatt: 10 %"
    assert shop.endpreis == "Endpreis: 101,07 €"


def test_menge_wird_je_produkt_gezaehlt(driver):
    shop = ShopScreen(driver).hinzufuegen("Tasse", 3).hinzufuegen("Kopfhörer")
    assert shop.menge("Tasse") == 3
    assert shop.menge("Kopfhörer") == 1
    assert shop.menge("Monitor 27 Zoll") == 0


def test_bestellung_als_stammkunde(driver):
    shop = ShopScreen(driver).hinzufuegen("Kopfhörer").als_stammkunde()
    assert shop.endpreis == "Endpreis: 75,05 €"
    shop.bestellen("Anna Berg")
    assert re.fullmatch(r"Bestellung B-\d{8}-\d{4} für Anna Berg über 75,05 €", shop.bestaetigung())
    shop.dialog_schliessen()
    assert shop.endpreis == "Endpreis: 0,00 €"             # Warenkorb nach der Bestellung leer


def test_name_ist_pflicht(driver):
    shop = ShopScreen(driver).hinzufuegen("Tasse").bestellen("")
    assert shop.fehler == "Bitte einen Namen angeben."


def test_zahlung_ueber_dem_limit_wird_abgelehnt(driver):
    shop = ShopScreen(driver).hinzufuegen("Monitor 27 Zoll", 2).bestellen("Ben Kraus")   # 628,20 €
    assert shop.fehler == "Die Zahlung wurde abgelehnt."
