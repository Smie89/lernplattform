package de.shop.api;

import de.shop.preise.Rabattrechner;
import de.shop.warenkoerbe.Warenkorb;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

/** Anfragen und Antworten der REST-API (JSON, camelCase). */
public final class Vertraege {

    private Vertraege() {
    }

    public record PositionAnfrage(String produktId, int menge) {
    }

    public record BestellAnfrage(String kundenName, boolean stammkunde) {
    }

    public record PositionAntwort(String produktId, String name, int menge, BigDecimal summe) {
    }

    public record WarenkorbAntwort(UUID id, List<PositionAntwort> positionen, BigDecimal zwischensumme,
                                   BigDecimal rabattSatz, BigDecimal endpreis) {

        public static WarenkorbAntwort von(Warenkorb w, Rabattrechner rabatt, boolean stammkunde) {
            var positionen = w.positionen().stream()
                .map(p -> new PositionAntwort(p.produkt().id(), p.produkt().name(), p.menge(), p.summe()))
                .toList();
            return new WarenkorbAntwort(w.id(), positionen, w.zwischensumme(),
                rabatt.rabattSatz(w.zwischensumme(), stammkunde), rabatt.endpreis(w.zwischensumme(), stammkunde));
        }
    }

    public record BestellAntwort(String bestellnummer, String kundenName, BigDecimal zwischensumme,
                                 BigDecimal endpreis) {
    }
}
