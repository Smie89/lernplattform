package de.shop.zahlung;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Simulierter Zahlungsdienst für die Demo: genehmigt Beträge bis zum Limit, lehnt höhere ab.
 * So lässt sich auch der Fehlerfall in API- und UI-Tests nachstellen.
 */
@Component
public class DemoZahlungsdienst implements Zahlungsdienst {

    public static final BigDecimal LIMIT = new BigDecimal("500");

    @Override
    public boolean abbuchen(String kundenName, BigDecimal betrag) {
        return betrag.compareTo(LIMIT) <= 0;
    }
}
