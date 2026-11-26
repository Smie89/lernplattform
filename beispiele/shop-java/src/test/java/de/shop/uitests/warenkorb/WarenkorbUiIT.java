package de.shop.uitests.warenkorb;

import de.shop.uitests.infrastruktur.UiTestBasis;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class WarenkorbUiIT extends UiTestBasis {

    @Test
    void beimStartIstDerWarenkorbLeer() {
        assertThat(shop.warenkorb().istLeer()).isTrue();
        assertThat(shop.warenkorb().endpreis()).isEqualTo("0,00 €");
    }

    @Test
    void ab100EuroWirdDerRabattAngezeigt() {
        shop.inDenWarenkorb("kopfhoerer", 2);   // 158 €

        assertThat(shop.warenkorb().zwischensumme()).isEqualTo("158,00 €");
        assertThat(shop.warenkorb().rabatt()).isEqualTo("10 %");
        assertThat(shop.warenkorb().endpreis()).isEqualTo("142,20 €");
    }

    @Test
    void entferntePositionVerschwindet() {
        shop.inDenWarenkorb("tasse");

        shop.warenkorb().entfernen("Tasse");

        assertThat(shop.warenkorb().enthaelt("tasse")).isFalse();
        assertThat(shop.warenkorb().istLeer()).isTrue();
    }
}
