package de.shop.apitests.warenkoerbe;

import de.shop.apitests.infrastruktur.Antworten.WarenkorbDto;
import de.shop.apitests.infrastruktur.ApiTestBasis;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;

class WarenkorbApiIT extends ApiTestBasis {

    @Test
    void neuerWarenkorbIstLeer() {
        var warenkorb = shop.neuerWarenkorb();

        assertThat(warenkorb.positionen()).isEmpty();
        assertThat(warenkorb.zwischensumme()).isZero();
    }

    @Test
    void produktHinzufuegenBerechnetSummen() {
        var warenkorb = shop.neuerWarenkorb();

        var inhalt = shop.hinzufuegen(warenkorb.id(), "kopfhoerer", 2)   // 2 x 79 €
            .then().statusCode(200)
            .extract().as(WarenkorbDto.class);

        assertThat(inhalt.zwischensumme()).isEqualByComparingTo("158");
        assertThat(inhalt.rabattSatz()).isEqualByComparingTo("0.10");
        assertThat(inhalt.endpreis()).isEqualByComparingTo("142.20");
    }

    @Test
    void stammkundeBekommtZusaetzlich5Prozent() {
        var warenkorb = shop.warenkorbMit("kopfhoerer", 2);

        var inhalt = shop.warenkorbAbrufen(warenkorb.id(), true)
            .then().statusCode(200)
            .extract().as(WarenkorbDto.class);

        assertThat(inhalt.endpreis()).isEqualByComparingTo("134.30");   // 158 € - 15 %
    }

    @Test
    void unbekanntesProduktLiefert400() {
        var warenkorb = shop.neuerWarenkorb();

        shop.hinzufuegen(warenkorb.id(), "gibt-es-nicht", 1)
            .then()
            .statusCode(400)
            .body("detail", containsString("gibt-es-nicht"));   // Prüfung im REST-Assured-Stil
    }

    @ParameterizedTest
    @ValueSource(ints = {0, 100})
    void ungueltigeMengeLiefert400(int menge) {
        var warenkorb = shop.neuerWarenkorb();

        shop.hinzufuegen(warenkorb.id(), "buch", menge).then().statusCode(400);
    }

    @Test
    void unbekannterWarenkorbLiefert404() {
        shop.warenkorbAbrufen(UUID.randomUUID(), false).then().statusCode(404);
    }
}
