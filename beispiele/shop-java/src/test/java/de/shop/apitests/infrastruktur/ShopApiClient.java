package de.shop.apitests.infrastruktur;

import de.shop.apitests.infrastruktur.Antworten.ProduktDto;
import de.shop.apitests.infrastruktur.Antworten.WarenkorbDto;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;

import java.util.List;
import java.util.Map;
import java.util.UUID;

import static io.restassured.RestAssured.given;

/**
 * Fachliche Methoden für die Shop-API – das Gegenstück zum Page Object bei API-Tests.
 * Die Tests kennen dadurch keine URLs und kein JSON-Format.
 */
public final class ShopApiClient {

    private final RequestSpecification spec;

    public ShopApiClient(RequestSpecification spec) {
        this.spec = spec;
    }

    public List<ProduktDto> produkte() {
        return List.of(given(spec).get("/produkte").then().statusCode(200)
            .extract().as(ProduktDto[].class));
    }

    public WarenkorbDto neuerWarenkorb() {
        return given(spec).post("/warenkoerbe").then().statusCode(201).extract().as(WarenkorbDto.class);
    }

    public Response warenkorbAbrufen(UUID id, boolean stammkunde) {
        return given(spec).queryParam("stammkunde", stammkunde).get("/warenkoerbe/{id}", id);
    }

    public Response hinzufuegen(UUID warenkorbId, String produktId, int menge) {
        return given(spec).body(Map.of("produktId", produktId, "menge", menge))
            .post("/warenkoerbe/{id}/positionen", warenkorbId);
    }

    public Response bestellen(UUID warenkorbId, String kundenName, boolean stammkunde) {
        return given(spec).body(Map.of("kundenName", kundenName, "stammkunde", stammkunde))
            .post("/warenkoerbe/{id}/bestellung", warenkorbId);
    }

    /** Abkürzung für Tests, die einen gefüllten Warenkorb nur als Vorbedingung brauchen. */
    public WarenkorbDto warenkorbMit(String produktId, int menge) {
        var warenkorb = neuerWarenkorb();
        hinzufuegen(warenkorb.id(), produktId, menge).then().statusCode(200);
        return warenkorb;
    }
}
