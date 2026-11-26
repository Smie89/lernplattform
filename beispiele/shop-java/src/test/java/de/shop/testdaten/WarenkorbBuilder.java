package de.shop.testdaten;

import de.shop.katalog.Produkt;
import de.shop.warenkoerbe.Warenkorb;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Test Data Builder: Erzeugt Warenkörbe lesbar in einer Zeile, z. B.
 * {@code einWarenkorb().mit(TestProdukte.BUCH, 2).bauen()}.
 */
public final class WarenkorbBuilder {

    private final Map<Produkt, Integer> positionen = new LinkedHashMap<>();

    private WarenkorbBuilder() {
    }

    public static WarenkorbBuilder einWarenkorb() {
        return new WarenkorbBuilder();
    }

    public WarenkorbBuilder mit(Produkt produkt, int menge) {
        positionen.merge(produkt, menge, Integer::sum);
        return this;
    }

    public WarenkorbBuilder mit(Produkt produkt) {
        return mit(produkt, 1);
    }

    /** Warenkorb mit genau dieser Zwischensumme (ein Testprodukt mit passendem Preis). */
    public WarenkorbBuilder mitWert(String zwischensumme) {
        return mit(TestProdukte.mitPreis(zwischensumme));
    }

    public Warenkorb bauen() {
        var warenkorb = new Warenkorb();
        positionen.forEach(warenkorb::hinzufuegen);
        return warenkorb;
    }
}
