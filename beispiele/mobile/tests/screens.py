"""Screen Object der Mini-Shop-App – das Page Object für mobile Apps.

Locator-Strategien, von stabil zu wackelig:
  1. Accessibility ID (content-desc)  – hilft zugleich Screenreader-Nutzern
  2. resource-id                      – feste ids aus dem Layout
  3. UiAutomator-Selektor             – mächtig, z. B. für Textanfänge
  4. XPath                            – langsam und bricht bei jeder Layoutänderung; vermeiden
"""
from appium.webdriver.common.appiumby import AppiumBy
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait

PAKET = "de.lernplattform.minishop"


def rid(name: str) -> tuple[str, str]:
    return AppiumBy.ID, f"{PAKET}:id/{name}"


class ShopScreen:
    def __init__(self, driver, timeout: float = 10):
        self.driver = driver
        self.warten = WebDriverWait(driver, timeout)

    # ---------- Hilfen ----------

    def _sichtbar(self, locator):
        return self.warten.until(EC.visibility_of_element_located(locator))

    def _wischen(self, richtung: str) -> bool:
        """Scrollt die Seite ein Stück – nur im mittleren Bereich der ScrollView, mit Abstand zu den Rändern.

        Befund in der CI: UiScrollable wischte im Querformat auf einem kleinen Bildschirm so nah am unteren Rand,
        dass die Gestensteuerung von Android das als "nach oben wischen = Startbildschirm" deutete
        ("Gesture Monitor swipe-up is stealing touch" im logcat) – die App verschwand in den Hintergrund.

        Rückgabe: True, wenn in diese Richtung noch weiter gescrollt werden kann.
        """
        flaeche = self.driver.find_element(AppiumBy.CLASS_NAME, "android.widget.ScrollView").rect
        rand_oben_unten = int(flaeche["height"] * 0.25)
        rand_seite = int(flaeche["width"] * 0.1)
        return self.driver.execute_script("mobile: scrollGesture", {
            "left": flaeche["x"] + rand_seite,
            "top": flaeche["y"] + rand_oben_unten,
            "width": flaeche["width"] - 2 * rand_seite,
            "height": flaeche["height"] - 2 * rand_oben_unten,
            "direction": richtung,
            "percent": 0.8,
        })

    def _finden(self, locator: tuple[str, str]):
        """Erst direkt suchen; ist das Element nicht auf dem Bildschirm, ein Stück scrollen und erneut suchen –
        erst nach unten, am Ende der Seite nach oben.

        Gewartet wird dabei auch, falls die App gerade erst (wieder) in den Vordergrund kommt.
        """
        richtung = ["down"]

        def versuch(d):
            treffer = [e for e in d.find_elements(*locator) if e.is_displayed()]
            if treffer:
                return treffer[0]
            if not self._wischen(richtung[0]):
                richtung[0] = "up" if richtung[0] == "down" else "down"
            return False

        return WebDriverWait(self.driver, 20, poll_frequency=0.2).until(versuch, message=f"nicht gefunden: {locator[1]}")

    def _scrollen_zu(self, beschreibung: str):
        return self._finden((AppiumBy.ACCESSIBILITY_ID, beschreibung))

    def _scrollen_zu_id(self, name: str):
        return self._finden(rid(name))

    # ---------- Produkte ----------

    def produktzeilen(self) -> list:
        self._sichtbar(rid("produkte"))
        return self.driver.find_elements(AppiumBy.ANDROID_UIAUTOMATOR, 'new UiSelector().descriptionStartsWith("Produkt ")')

    def hinzufuegen(self, produktname: str, anzahl: int = 1) -> "ShopScreen":
        for _ in range(anzahl):
            self._scrollen_zu(f"{produktname} in den Warenkorb")
            self.driver.find_element(AppiumBy.ACCESSIBILITY_ID, f"{produktname} in den Warenkorb").click()
        return self

    def menge(self, produktname: str) -> int:
        zeile = self._scrollen_zu(f"Produkt {produktname}")
        return int(zeile.find_element(*rid("menge")).text)   # Suche innerhalb der Zeile

    # ---------- Warenkorb ----------

    def text(self, name: str) -> str:
        return self._scrollen_zu_id(name).text

    @property
    def endpreis(self) -> str:
        return self.text("endpreis")

    @property
    def rabatt(self) -> str:
        return self.text("rabatt")

    def als_stammkunde(self) -> "ShopScreen":
        checkbox = self._scrollen_zu_id("stammkunde")
        if checkbox.get_attribute("checked") != "true":
            checkbox.click()
        return self

    def bestellen(self, name: str = "") -> "ShopScreen":
        feld = self._scrollen_zu_id("kundenname")
        feld.clear()
        if name:
            feld.send_keys(name)
        if self.driver.is_keyboard_shown():
            self.driver.hide_keyboard()   # sonst verdeckt die Tastatur den Knopf
        self._scrollen_zu_id("bestellen").click()
        return self

    @property
    def fehler(self) -> str:
        return self.text("fehler")

    # ---------- Dialog nach der Bestellung (Android-Standarddialog) ----------

    def bestaetigung(self) -> str:
        return self._sichtbar((AppiumBy.ID, "android:id/message")).text

    def dialog_schliessen(self) -> "ShopScreen":
        self.driver.find_element(AppiumBy.ID, "android:id/button1").click()
        return self
