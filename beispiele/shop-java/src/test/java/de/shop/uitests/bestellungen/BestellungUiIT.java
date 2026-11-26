package de.shop.uitests.bestellungen;

import de.shop.uitests.infrastruktur.UiTestBasis;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class BestellungUiIT extends UiTestBasis {

    @Test
    void stammkundeKannBestellenUndSiehtBestaetigung() {
        shop.inDenWarenkorb("buch");

        shop.bestellen("Anna Beispiel", true);

        assertThat(shop.bestaetigung())
            .contains("Vielen Dank, Anna Beispiel!")
            .contains("23,66 €");                       // 24,90 € - 5 %
        assertThat(shop.warenkorb().istLeer()).isTrue();  // neuer, leerer Warenkorb
    }

    @Test
    void bestellungOhneNamenZeigtFehlermeldung() {
        shop.inDenWarenkorb("buch");

        shop.bestellen("", false);

        assertThat(shop.fehlermeldung()).isEqualTo("Bitte einen Namen angeben.");
        assertThat(shop.bestaetigungSichtbar()).isFalse();
    }
}
