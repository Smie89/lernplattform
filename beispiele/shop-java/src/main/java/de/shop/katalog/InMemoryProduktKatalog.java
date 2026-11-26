package de.shop.katalog;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/** Fester Demo-Katalog. In einer echten Anwendung käme er aus einer Datenbank. */
@Component
public class InMemoryProduktKatalog implements ProduktKatalog {

    private static final List<Produkt> PRODUKTE = List.of(
        new Produkt("buch", "Fachbuch Testautomation", new BigDecimal("24.90")),
        new Produkt("tasse", "Tasse", new BigDecimal("12.50")),
        new Produkt("kopfhoerer", "Kopfhörer", new BigDecimal("79.00")),
        new Produkt("rucksack", "Rucksack", new BigDecimal("49.90")),
        new Produkt("monitor", "Monitor 27 Zoll", new BigDecimal("349.00")));

    @Override
    public List<Produkt> alle() {
        return PRODUKTE;
    }

    @Override
    public Optional<Produkt> finde(String id) {
        return PRODUKTE.stream().filter(p -> p.id().equals(id)).findFirst();
    }
}
