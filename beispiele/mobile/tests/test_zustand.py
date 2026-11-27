"""Mobile Besonderheiten: Drehen, Hintergrund, Neustart.

Beim Drehen zerstört Android die Activity und baut sie neu auf. Was die App nicht ausdrücklich sichert
(onSaveInstanceState), ist danach weg – einer der häufigsten Fehler in mobilen Apps.
"""
import time

from appium.webdriver.applicationstate import ApplicationState
from selenium.webdriver.support.ui import WebDriverWait

from screens import PAKET, ShopScreen


def test_warenkorb_bleibt_beim_drehen_erhalten(driver):
    shop = ShopScreen(driver).hinzufuegen("Tasse", 2).als_stammkunde()
    driver.orientation = "LANDSCAPE"
    assert shop.menge("Tasse") == 2
    assert shop.endpreis == "Endpreis: 23,75 €"            # 25,00 € − 5 %: auch die Checkbox ist noch gesetzt
    driver.orientation = "PORTRAIT"
    assert shop.menge("Tasse") == 2


def test_warenkorb_bleibt_nach_kurzer_zeit_im_hintergrund_erhalten(driver):
    """Befund beim Schreiben des Tests: driver.background_app(2) holte die App auf dem Emulator (Android 17,
    UiAutomator2-Treiber 10.4) nur manchmal zurück – der Startbildschirm blieb vorn. Deshalb ausdrücklich:
    in den Hintergrund, warten, zurückholen und prüfen, dass die App wirklich vorn ist."""
    shop = ShopScreen(driver).hinzufuegen("Rucksack")
    driver.execute_script("mobile: backgroundApp", {"seconds": -1})   # -1 = im Hintergrund bleiben
    time.sleep(2)                                                      # gewollt: Zeit im Hintergrund
    driver.activate_app(PAKET)
    WebDriverWait(driver, 10).until(lambda d: d.query_app_state(PAKET) == ApplicationState.RUNNING_IN_FOREGROUND)
    assert shop.menge("Rucksack") == 1


def test_neustart_der_app_beginnt_mit_leerem_warenkorb(driver):
    """Bewusst so: Der Warenkorb wird nicht dauerhaft gespeichert. Der Test hält das Verhalten fest."""
    ShopScreen(driver).hinzufuegen("Rucksack")
    driver.terminate_app("de.lernplattform.minishop")
    driver.activate_app("de.lernplattform.minishop")
    assert ShopScreen(driver).menge("Rucksack") == 0
