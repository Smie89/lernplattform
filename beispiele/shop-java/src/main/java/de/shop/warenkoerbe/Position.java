package de.shop.warenkoerbe;

import de.shop.katalog.Produkt;

import java.math.BigDecimal;

public record Position(Produkt produkt, int menge) {

    public BigDecimal summe() {
        return produkt.preis().multiply(BigDecimal.valueOf(menge));
    }
}
