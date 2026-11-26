package de.shop.bestellungen;

import de.shop.warenkoerbe.Position;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record Bestellung(
    String bestellnummer,
    Kunde kunde,
    List<Position> positionen,
    BigDecimal zwischensumme,
    BigDecimal endpreis,
    Instant zeitpunkt) {
}
