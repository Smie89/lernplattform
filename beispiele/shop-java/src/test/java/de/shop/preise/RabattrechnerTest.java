package de.shop.preise;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class RabattrechnerTest {

    private final Rabattrechner rechner = new Rabattrechner();   // zustandslos – darf geteilt werden

    @ParameterizedTest(name = "{0} €, Stammkunde={1} → {2} €")
    @CsvSource({
        "0,      false, 0",
        "99.99,  false, 99.99",    // knapp unter der Schwelle: kein Rabatt
        "100,    false, 90",       // genau auf der Schwelle: 10 %
        "250,    false, 225",
        "50,     true,  47.50",    // Stammkunde unter der Schwelle: 5 %
        "100,    true,  85"        // Stammkunde ab Schwelle: 15 %
    })
    void endpreisWendetRabattregelnAn(BigDecimal zwischensumme, boolean stammkunde, BigDecimal erwartet) {
        var endpreis = rechner.endpreis(zwischensumme, stammkunde);

        assertThat(endpreis).isEqualByComparingTo(erwartet);
    }

    @Test
    void endpreisWirdKaufmaennischAufCentGerundet() {
        // 100,05 € * 0,85 = 85,0425 € -> 85,04 €
        var endpreis = rechner.endpreis(new BigDecimal("100.05"), true);

        assertThat(endpreis).isEqualByComparingTo("85.04");
    }

    @Test
    void negativeZwischensummeWirdAbgelehnt() {
        assertThatThrownBy(() -> rechner.endpreis(new BigDecimal("-1"), false))
            .isInstanceOf(IllegalArgumentException.class);
    }
}
