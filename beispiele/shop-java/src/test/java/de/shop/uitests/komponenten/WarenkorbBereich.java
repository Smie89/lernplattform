package de.shop.uitests.komponenten;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

/** Komponente für den Warenkorb-Bereich. Speichert Locators (By), keine WebElements. */
public final class WarenkorbBereich {

    private static final By BEREICH = By.cssSelector("section.warenkorb");
    private static final By LEER = By.cssSelector("[data-testid='warenkorb-leer']");

    private final WebDriver driver;
    private final WebDriverWait wait;

    public WarenkorbBereich(WebDriver driver, WebDriverWait wait) {
        this.driver = driver;
        this.wait = wait;
    }

    public String zwischensumme() {
        return text("zwischensumme");
    }

    public String rabatt() {
        return text("rabatt");
    }

    public String endpreis() {
        return text("endpreis");
    }

    public boolean istLeer() {
        return bereich().findElement(LEER).isDisplayed();
    }

    public int mengeVon(String produktId) {
        var zeilen = bereich().findElements(position(produktId));
        return zeilen.isEmpty() ? 0 : Integer.parseInt(zeilen.get(0).findElement(MENGE).getText());
    }

    /** Technisches Warten (kein fachlicher Assert): bis die Oberfläche die neue Menge zeigt. */
    public void warteAufMenge(String produktId, int menge) {
        wait.until(d -> mengeVon(produktId) == menge);
    }

    public void entfernen(String produktName) {
        bereich().findElement(By.cssSelector("button[aria-label='" + produktName + " entfernen']")).click();
        wait.until(ExpectedConditions.visibilityOfElementLocated(LEER));
    }

    public boolean enthaelt(String produktId) {
        return !bereich().findElements(position(produktId)).isEmpty();
    }

    private static final By MENGE = By.cssSelector("[data-testid='menge']");

    private static By position(String produktId) {
        return By.cssSelector("[data-testid='position-" + produktId + "']");
    }

    private WebElement bereich() {
        return driver.findElement(BEREICH);
    }

    private String text(String testId) {
        return bereich().findElement(By.cssSelector("[data-testid='" + testId + "']")).getText();
    }
}
