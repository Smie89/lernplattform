package de.shop.katalog;

import java.math.BigDecimal;

/** Ein Artikel im Sortiment. */
public record Produkt(String id, String name, BigDecimal preis) {
}
