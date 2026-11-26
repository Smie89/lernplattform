package de.shop.warenkoerbe;

import de.shop.katalog.Produkt;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

public class Warenkorb {

    public static final int MAXIMALE_MENGE = 99;

    private final UUID id = UUID.randomUUID();
    private final List<Position> positionen = new ArrayList<>();

    public UUID id() {
        return id;
    }

    public List<Position> positionen() {
        return Collections.unmodifiableList(positionen);
    }

    public boolean istLeer() {
        return positionen.isEmpty();
    }

    public BigDecimal zwischensumme() {
        return positionen.stream().map(Position::summe).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /** Fügt ein Produkt hinzu. Ist es schon im Warenkorb, wird die Menge erhöht. */
    public void hinzufuegen(Produkt produkt, int menge) {
        int index = indexVon(produkt.id());
        int neueMenge = (index >= 0 ? positionen.get(index).menge() : 0) + menge;

        if (menge < 1 || neueMenge > MAXIMALE_MENGE) {
            throw new IllegalArgumentException(
                "Die Menge pro Produkt muss zwischen 1 und " + MAXIMALE_MENGE + " liegen.");
        }

        if (index >= 0) {
            positionen.set(index, new Position(produkt, neueMenge));
        } else {
            positionen.add(new Position(produkt, menge));
        }
    }

    public void entfernen(String produktId) {
        positionen.removeIf(p -> p.produkt().id().equals(produktId));
    }

    private int indexVon(String produktId) {
        for (int i = 0; i < positionen.size(); i++) {
            if (positionen.get(i).produkt().id().equals(produktId)) return i;
        }
        return -1;
    }
}
