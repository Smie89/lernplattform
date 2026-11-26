package de.shop.warenkoerbe;

import de.shop.testdaten.TestProdukte;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static de.shop.testdaten.WarenkorbBuilder.einWarenkorb;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DisplayName("Warenkorb")
class WarenkorbTest {

    @Test
    void neuerWarenkorbIstLeer() {
        var warenkorb = new Warenkorb();

        assertThat(warenkorb.istLeer()).isTrue();
        assertThat(warenkorb.zwischensumme()).isZero();
    }

    @Test
    void hinzufuegenBerechnetZwischensumme() {
        var warenkorb = einWarenkorb()
            .mit(TestProdukte.BUCH, 2)    // 2 x 25 €
            .mit(TestProdukte.TASSE)      // 1 x 10 €
            .bauen();

        assertThat(warenkorb.zwischensumme()).isEqualByComparingTo("60");
    }

    @Test
    void gleichesProduktErhoehtMengeStattNeuerPosition() {
        var warenkorb = einWarenkorb().mit(TestProdukte.BUCH).bauen();

        warenkorb.hinzufuegen(TestProdukte.BUCH, 2);

        assertThat(warenkorb.positionen()).singleElement()
            .extracting(Position::menge).isEqualTo(3);
    }

    @Test
    void entfernenLoeschtDiePosition() {
        var warenkorb = einWarenkorb().mit(TestProdukte.BUCH).mit(TestProdukte.TASSE).bauen();

        warenkorb.entfernen(TestProdukte.BUCH.id());

        assertThat(warenkorb.positionen()).extracting(Position::produkt).containsExactly(TestProdukte.TASSE);
    }

    // @Nested gruppiert zusammengehörige Fälle – im Testbericht erscheinen sie eingerückt.
    @Nested
    @DisplayName("bei ungültiger Menge")
    class UngueltigeMenge {

        @ParameterizedTest
        @ValueSource(ints = {0, -1, Warenkorb.MAXIMALE_MENGE + 1})
        void wirdAbgelehnt(int menge) {
            var warenkorb = new Warenkorb();

            assertThatThrownBy(() -> warenkorb.hinzufuegen(TestProdukte.BUCH, menge))
                .isInstanceOf(IllegalArgumentException.class);
        }

        @Test
        void darfAuchInSummeDasMaximumNichtUeberschreiten() {
            var warenkorb = einWarenkorb().mit(TestProdukte.BUCH, Warenkorb.MAXIMALE_MENGE).bauen();

            assertThatThrownBy(() -> warenkorb.hinzufuegen(TestProdukte.BUCH, 1))
                .isInstanceOf(IllegalArgumentException.class);
        }
    }
}
