package de.shop.apitests.bestellungen;

import de.shop.apitests.infrastruktur.Antworten.BestellungDto;
import de.shop.apitests.infrastruktur.ApiTestBasis;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import static io.restassured.RestAssured.given;
import static org.assertj.core.api.Assertions.assertThat;

class BestellungApiIT extends ApiTestBasis {

    @Test
    void bestellungWirdAngelegtUndIstAbrufbar() {
        var warenkorb = shop.warenkorbMit("buch", 1);

        var antwort = shop.bestellen(warenkorb.id(), "Max Muster", false);

        antwort.then().statusCode(201);
        var bestellung = antwort.as(BestellungDto.class);
        assertThat(bestellung.endpreis()).isEqualByComparingTo("24.90");

        var abgerufen = given(api).basePath("").get(antwort.header("Location"))
            .then().statusCode(200).extract().as(BestellungDto.class);
        assertThat(abgerufen.bestellnummer()).isEqualTo(bestellung.bestellnummer());
    }

    @Test
    void nachDerBestellungIstDerWarenkorbWeg() {
        var warenkorb = shop.warenkorbMit("tasse", 1);
        shop.bestellen(warenkorb.id(), "Max Muster", false).then().statusCode(201);

        shop.warenkorbAbrufen(warenkorb.id(), false).then().statusCode(404);
    }

    @Test
    void leererWarenkorbKannNichtBestelltWerden() {
        var warenkorb = shop.neuerWarenkorb();

        shop.bestellen(warenkorb.id(), "Max Muster", false).then().statusCode(400);
    }

    @ParameterizedTest
    @ValueSource(strings = {"", "   "})
    void bestellungOhneNamenWirdAbgelehnt(String name) {
        var warenkorb = shop.warenkorbMit("buch", 1);

        shop.bestellen(warenkorb.id(), name, false).then().statusCode(400);
    }

    @Test
    void zahlungUeberDemLimitWirdMit422Abgelehnt() {
        var warenkorb = shop.warenkorbMit("monitor", 2);   // 698 € - 10 % = 628,20 € > 500 €

        shop.bestellen(warenkorb.id(), "Max Muster", false).then().statusCode(422);
    }
}
