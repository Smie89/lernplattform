package de.shop.uitests.seiten;

import de.shop.uitests.komponenten.WarenkorbBereich;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;

/** Page Object für die einzige Seite des Mini-Shops. */
public final class ShopSeite {

    private static final By BEREIT = By.cssSelector("body[data-bereit='true']");
    private static final By NAME = By.id("kundenname");
    private static final By STAMMKUNDE = By.id("stammkunde");
    private static final By BESTELLEN = By.cssSelector("#bestellformular button[type='submit']");
    private static final By BESTAETIGUNG = By.cssSelector("[data-testid='bestaetigung']");
    private static final By FEHLER = By.cssSelector("[data-testid='fehler']");

    private final WebDriver driver;
    private final WebDriverWait wait;
    private final WarenkorbBereich warenkorb;

    private ShopSeite(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        this.warenkorb = new WarenkorbBereich(driver, wait);
    }

    public static ShopSeite oeffnen(WebDriver driver, String basisUrl) {
        driver.get(basisUrl + "/");
        var seite = new ShopSeite(driver);
        seite.wait.until(ExpectedConditions.presenceOfElementLocated(BEREIT));   // Seite fertig geladen
        return seite;
    }

    public WarenkorbBereich warenkorb() {
        return warenkorb;
    }

    public void inDenWarenkorb(String produktId, int anzahl) {
        By knopf = By.cssSelector("[data-testid='produkt-" + produktId + "'] button");
        for (int i = 0; i < anzahl; i++) {
            int vorher = warenkorb.mengeVon(produktId);
            driver.findElement(knopf).click();
            warenkorb.warteAufMenge(produktId, vorher + 1);
        }
    }

    public void inDenWarenkorb(String produktId) {
        inDenWarenkorb(produktId, 1);
    }

    public void bestellen(String name, boolean stammkunde) {
        var feld = driver.findElement(NAME);
        feld.clear();
        feld.sendKeys(name);
        WebElement checkbox = driver.findElement(STAMMKUNDE);
        if (checkbox.isSelected() != stammkunde) checkbox.click();
        driver.findElement(BESTELLEN).click();
    }

    /** Wartet, bis die Bestätigung sichtbar ist, und liefert ihren Text. Die Prüfung macht der Test. */
    public String bestaetigung() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(BESTAETIGUNG)).getText();
    }

    public String fehlermeldung() {
        return wait.until(ExpectedConditions.visibilityOfElementLocated(FEHLER)).getText();
    }

    public boolean bestaetigungSichtbar() {
        return driver.findElement(BESTAETIGUNG).isDisplayed();
    }
}
