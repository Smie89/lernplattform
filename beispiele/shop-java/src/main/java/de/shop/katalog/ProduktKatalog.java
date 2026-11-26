package de.shop.katalog;

import java.util.List;
import java.util.Optional;

public interface ProduktKatalog {
    List<Produkt> alle();

    Optional<Produkt> finde(String id);
}
