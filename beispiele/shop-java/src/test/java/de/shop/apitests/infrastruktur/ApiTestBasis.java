package de.shop.apitests.infrastruktur;

import de.shop.ShopAnwendung;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.filter.log.LogDetail;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.core.env.Environment;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * Basisklasse für alle API-Tests: startet die Anwendung auf einem freien Port.
 * Spring hält den gestarteten Kontext im Cache – er wird für alle Testklassen nur EINMAL gestartet.
 * Enthält nur Technik – keine fachlichen Schritte und keine Asserts.
 */
@SpringBootTest(classes = ShopAnwendung.class, webEnvironment = WebEnvironment.RANDOM_PORT)
public abstract class ApiTestBasis {

    @Autowired
    private Environment umgebung;

    protected ShopApiClient shop;
    protected RequestSpecification api;

    @BeforeEach
    void clientErstellen() {
        api = new RequestSpecBuilder()
            .setBaseUri("http://localhost")
            .setPort(Integer.parseInt(umgebung.getRequiredProperty("local.server.port")))
            .setBasePath("/api")
            .setContentType(ContentType.JSON)
            .log(LogDetail.URI)
            .build();
        shop = new ShopApiClient(api);
    }
}
