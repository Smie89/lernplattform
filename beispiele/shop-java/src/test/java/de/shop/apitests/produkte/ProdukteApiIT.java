package de.shop.apitests.produkte;

import de.shop.apitests.infrastruktur.Antworten.ProduktDto;
import de.shop.apitests.infrastruktur.ApiTestBasis;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ProdukteApiIT extends ApiTestBasis {

    @Test
    void produktlisteIstNichtLeerUndHatGueltigePreise() {
        var produkte = shop.produkte();

        assertThat(produkte).isNotEmpty()
            .allSatisfy(p -> {
                assertThat(p.preis()).isPositive();
                assertThat(p.name()).isNotBlank();
            });
    }

    @Test
    void produktIdsSindEindeutig() {
        var produkte = shop.produkte();

        assertThat(produkte).extracting(ProduktDto::id).doesNotHaveDuplicates();
    }
}
