package de.lernplattform.minishop;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/** Warenkorb und Rabattregeln wie im Web-Shop: ab 100 € 10 %, Stammkunden zusätzlich 5 %. Ohne Android-Abhängigkeiten. */
public final class Warenkorb {

    public record Produkt(String id, String name, BigDecimal preis) { }

    public static final List<Produkt> KATALOG = List.of(
            new Produkt("buch", "Fachbuch Testautomation", new BigDecimal("24.90")),
            new Produkt("tasse", "Tasse", new BigDecimal("12.50")),
            new Produkt("kopfhoerer", "Kopfhörer", new BigDecimal("79.00")),
            new Produkt("rucksack", "Rucksack", new BigDecimal("49.90")),
            new Produkt("monitor", "Monitor 27 Zoll", new BigDecimal("349.00")));

    public static final BigDecimal RABATTSCHWELLE = new BigDecimal("100");
    public static final BigDecimal ZAHLUNGSLIMIT = new BigDecimal("500");
    public static final int MAXIMALE_MENGE = 99;

    private final int[] mengen;

    public Warenkorb() {
        this(new int[KATALOG.size()]);
    }

    /** Wiederherstellen, z. B. nach dem Drehen des Geräts. */
    public Warenkorb(int[] mengen) {
        this.mengen = mengen.clone();
    }

    public int[] mengen() {
        return mengen.clone();
    }

    public int menge(int index) {
        return mengen[index];
    }

    public void hinzufuegen(int index) {
        if (mengen[index] >= MAXIMALE_MENGE) {
            throw new IllegalStateException("Höchstens " + MAXIMALE_MENGE + " Stück pro Produkt.");
        }
        mengen[index]++;
    }

    public boolean istLeer() {
        for (int m : mengen) {
            if (m > 0) return false;
        }
        return true;
    }

    public void leeren() {
        java.util.Arrays.fill(mengen, 0);
    }

    public BigDecimal zwischensumme() {
        BigDecimal summe = BigDecimal.ZERO;
        for (int i = 0; i < mengen.length; i++) {
            summe = summe.add(KATALOG.get(i).preis().multiply(BigDecimal.valueOf(mengen[i])));
        }
        return summe;
    }

    public static BigDecimal rabattSatz(BigDecimal zwischensumme, boolean stammkunde) {
        BigDecimal satz = zwischensumme.compareTo(RABATTSCHWELLE) >= 0 ? new BigDecimal("0.10") : BigDecimal.ZERO;
        return stammkunde ? satz.add(new BigDecimal("0.05")) : satz;
    }

    public BigDecimal endpreis(boolean stammkunde) {
        BigDecimal summe = zwischensumme();
        return summe.multiply(BigDecimal.ONE.subtract(rabattSatz(summe, stammkunde))).setScale(2, RoundingMode.HALF_UP);
    }
}
