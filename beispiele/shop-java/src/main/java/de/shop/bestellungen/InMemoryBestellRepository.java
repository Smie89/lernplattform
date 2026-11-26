package de.shop.bestellungen;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class InMemoryBestellRepository implements BestellRepository {

    private final Map<String, Bestellung> bestellungen = new ConcurrentHashMap<>();

    @Override
    public void speichern(Bestellung bestellung) {
        bestellungen.put(bestellung.bestellnummer(), bestellung);
    }

    @Override
    public Optional<Bestellung> finde(String bestellnummer) {
        return Optional.ofNullable(bestellungen.get(bestellnummer));
    }
}
