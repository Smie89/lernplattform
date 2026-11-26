package de.shop.bestellungen;

import java.util.Optional;

public interface BestellRepository {
    void speichern(Bestellung bestellung);

    Optional<Bestellung> finde(String bestellnummer);
}
