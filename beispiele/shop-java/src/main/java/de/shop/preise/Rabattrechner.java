package de.shop.preise;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Rabattregeln des Shops:
 * ab 100 € Zwischensumme 10 %, Stammkunden erhalten zusätzlich 5 %.
 */
@Component
public class Rabattrechner {

    public static final BigDecimal RABATTSCHWELLE = new BigDecimal("100");
    public static final BigDecimal MENGEN_RABATT = new BigDecimal("0.10");
    public static final BigDecimal STAMMKUNDEN_RABATT = new BigDecimal("0.05");

    public BigDecimal rabattSatz(BigDecimal zwischensumme, boolean stammkunde) {
        if (zwischensumme.signum() < 0) {
            throw new IllegalArgumentException("Die Zwischensumme darf nicht negativ sein.");
        }
        var satz = zwischensumme.compareTo(RABATTSCHWELLE) >= 0 ? MENGEN_RABATT : BigDecimal.ZERO;
        return stammkunde ? satz.add(STAMMKUNDEN_RABATT) : satz;
    }

    public BigDecimal endpreis(BigDecimal zwischensumme, boolean stammkunde) {
        var faktor = BigDecimal.ONE.subtract(rabattSatz(zwischensumme, stammkunde));
        return zwischensumme.multiply(faktor).setScale(2, RoundingMode.HALF_UP);
    }
}
