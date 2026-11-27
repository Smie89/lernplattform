"""Page Object für die Oberfläche des Mini-Shops (Playwright für Python)."""
from playwright.sync_api import Locator, Page, expect


class ShopSeite:
    def __init__(self, page: Page):
        self.page = page
        self.endpreis: Locator = page.get_by_test_id("endpreis")
        self.rabatt: Locator = page.get_by_test_id("rabatt")
        self.bestaetigung: Locator = page.get_by_test_id("bestaetigung")
        self.fehler: Locator = page.get_by_test_id("fehler")

    def oeffnen(self) -> "ShopSeite":
        self.page.goto("/")
        expect(self.page.get_by_test_id("produktliste").get_by_role("listitem")).to_have_count(5)
        return self

    def in_den_warenkorb(self, produkt_id: str, anzahl: int = 1) -> "ShopSeite":
        knopf = self.page.get_by_test_id(f"produkt-{produkt_id}").get_by_role("button", name="In den Warenkorb")
        menge = self.page.get_by_test_id(f"position-{produkt_id}").get_by_test_id("menge")
        for i in range(1, anzahl + 1):
            knopf.click()
            expect(menge).to_have_text(str(i))   # warten, bis die API geantwortet hat
        return self

    def als_stammkunde(self) -> "ShopSeite":
        self.page.get_by_label("Stammkunde").check()
        return self

    def bestellen(self, name: str) -> "ShopSeite":
        self.page.get_by_label("Name").fill(name)
        self.page.get_by_role("button", name="Bestellen").click()
        return self
