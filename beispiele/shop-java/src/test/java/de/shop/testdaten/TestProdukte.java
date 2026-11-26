package de.shop.testdaten;

import de.shop.katalog.Produkt;

import java.math.BigDecimal;

/**
 * Feste Produkte für Unit-Tests. Bewusst unabhängig vom Demo-Katalog der Anwendung:
 * Ändert jemand dort einen Preis, sollen die Unit-Tests nicht brechen.
 */
public final class TestProdukte {

    public static final Produkt BUCH = new Produkt("buch", "Buch", new BigDecimal("25.00"));
    public static final Produkt TASSE = new Produkt("tasse", "Tasse", new BigDecimal("10.00"));
    public static final Produkt MONITOR = new Produkt("monitor", "Monitor", new BigDecimal("300.00"));

    private TestProdukte() {
    }

    /** Ein Produkt mit beliebigem Preis, z. B. um eine Grenze genau zu treffen. */
    public static Produkt mitPreis(String preis) {
        return new Produkt("test-" + preis, "Testprodukt " + preis + " €", new BigDecimal(preis));
    }
}
