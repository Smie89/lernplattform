package de.shop.uitests.infrastruktur;

import de.shop.ShopAnwendung;
import de.shop.uitests.seiten.ShopSeite;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.core.env.Environment;

/**
 * Basisklasse für alle UI-Tests: Anwendung auf freiem Port, frischer Browser pro Test, Shop-Seite geöffnet.
 * Gegen eine bereits laufende Umgebung testen: Umgebungsvariable SHOP_URL setzen.
 */
@SpringBootTest(classes = ShopAnwendung.class, webEnvironment = WebEnvironment.RANDOM_PORT)
public abstract class UiTestBasis {

    @Autowired
    private Environment umgebung;

    protected WebDriver driver;
    protected ShopSeite shop;

    @BeforeEach
    void browserStarten() {
        var options = new ChromeOptions();
        if (!"false".equals(System.getenv("HEADLESS"))) {
            options.addArguments("--headless=new");     // zum Zuschauen: HEADLESS=false setzen
        }
        options.addArguments("--window-size=1280,800", "--lang=de-DE");
        driver = new ChromeDriver(options);              // Selenium Manager besorgt den Treiber

        shop = ShopSeite.oeffnen(driver, basisUrl());
    }

    @AfterEach
    void browserBeenden() {
        if (driver != null) driver.quit();
    }

    private String basisUrl() {
        var vorhanden = System.getenv("SHOP_URL");
        return vorhanden != null && !vorhanden.isBlank()
            ? vorhanden
            : "http://localhost:" + umgebung.getRequiredProperty("local.server.port");
    }
}
