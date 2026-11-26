package de.shop.apitests.infrastruktur;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/**
 * Eigene Abbildung der JSON-Antworten. Absichtlich NICHT die Klassen aus de.shop.api:
 * Benennt dort jemand ein Feld um, sollen die Tests den Vertragsbruch bemerken.
 */
public final class Antworten {

    private Antworten() {
    }

    public record ProduktDto(String id, String name, BigDecimal preis) {
    }

    public record PositionDto(String produktId, String name, int menge, BigDecimal summe) {
    }

    public record WarenkorbDto(UUID id, List<PositionDto> positionen, BigDecimal zwischensumme,
                               BigDecimal rabattSatz, BigDecimal endpreis) {
    }

    public record BestellungDto(String bestellnummer, String kundenName, BigDecimal zwischensumme,
                                BigDecimal endpreis) {
    }
}
