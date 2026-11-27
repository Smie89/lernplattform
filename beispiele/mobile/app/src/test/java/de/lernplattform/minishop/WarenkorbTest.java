package de.lernplattform.minishop;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;
import static org.junit.Assert.assertTrue;

import java.math.BigDecimal;
import org.junit.Test;

/** Unit-Tests der App-Logik: laufen in Sekunden auf der JVM – ohne Emulator. Basis der mobilen Testpyramide. */
public class WarenkorbTest {

    private static final int TASSE = 1;
    private static final int RUCKSACK = 3;

    @Test
    public void rabattAbHundertEuro() {
        Warenkorb w = new Warenkorb();
        w.hinzufuegen(RUCKSACK);
        w.hinzufuegen(RUCKSACK);                      // 99,80 €
        assertEquals(new BigDecimal("99.80"), w.endpreis(false));
        w.hinzufuegen(TASSE);                         // 112,30 €
        assertEquals(new BigDecimal("101.07"), w.endpreis(false));
    }

    @Test
    public void stammkundeBekommtZusaetzlichFuenfProzent() {
        assertEquals(new BigDecimal("0.15"), Warenkorb.rabattSatz(new BigDecimal("100"), true));
        assertEquals(new BigDecimal("0.05"), Warenkorb.rabattSatz(new BigDecimal("99.99"), true));
    }

    @Test
    public void hoechstmengeWirdEingehalten() {
        Warenkorb w = new Warenkorb();
        for (int i = 0; i < Warenkorb.MAXIMALE_MENGE; i++) w.hinzufuegen(TASSE);
        assertThrows(IllegalStateException.class, () -> w.hinzufuegen(TASSE));
    }

    @Test
    public void zustandLaesstSichWiederherstellen() {
        Warenkorb w = new Warenkorb();
        w.hinzufuegen(TASSE);
        Warenkorb kopie = new Warenkorb(w.mengen());
        assertEquals(1, kopie.menge(TASSE));
        kopie.leeren();
        assertTrue(kopie.istLeer());
        assertEquals(1, w.menge(TASSE));              // Original bleibt unverändert
    }
}
