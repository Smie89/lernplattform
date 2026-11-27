"""Browser-Tests mit pytest-playwright: die Fixture "page" kommt vom Plugin."""
import re

import pytest
from playwright.sync_api import expect

from .seiten import ShopSeite

pytestmark = pytest.mark.ui


def test_rabatt_ab_100_euro(page):
    shop = ShopSeite(page).oeffnen().in_den_warenkorb("rucksack", 2)   # 99,80 €
    expect(shop.rabatt).to_have_text("0 %")
    shop.in_den_warenkorb("tasse")                                      # 112,30 €
    expect(shop.rabatt).to_have_text("10 %")
    expect(shop.endpreis).to_have_text("101,07 €")


def test_bestellung_als_stammkunde(page):
    shop = ShopSeite(page).oeffnen().in_den_warenkorb("kopfhoerer").als_stammkunde()
    expect(shop.endpreis).to_have_text("75,05 €")
    shop.bestellen("Anna Berg")
    expect(shop.bestaetigung).to_have_text(re.compile(r"Bestellung B-\d{8}-\w{6}"))


def test_fehlermeldung_bei_zu_hohem_betrag(page):
    shop = ShopSeite(page).oeffnen().in_den_warenkorb("monitor", 2).bestellen("Ben Kraus")
    expect(shop.fehler).to_contain_text("Zahlung wurde abgelehnt")
