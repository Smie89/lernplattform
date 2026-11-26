package de.shop.zahlung;

import java.math.BigDecimal;

public interface Zahlungsdienst {
    /** @return true, wenn der Betrag abgebucht werden konnte. */
    boolean abbuchen(String kundenName, BigDecimal betrag);
}
