// Gegenstück zu beispiele/entwicklung/src/Entwicklung.Beispiele/Sprachvergleich/Bestellauswertung.cs
// Ausführen ohne Build-Werkzeug (Java 21+):   java Sprachvergleich.java
// Die Methode main prüft die Ergebnisse selbst und endet mit Exit-Code 1, wenn etwas nicht stimmt.

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

public class Sprachvergleich {

    // Records: unveränderliche Datenklassen mit equals/hashCode/toString
    record Position(String artikel, String kategorie, int menge, BigDecimal einzelpreis) {
        BigDecimal summe() {
            return einzelpreis.multiply(BigDecimal.valueOf(menge));
        }
    }

    // sealed: nur die aufgezählten Typen dürfen Zahlungsart implementieren
    sealed interface Zahlungsart permits Kreditkarte, Rechnung, Gutschein {}
    record Kreditkarte(String endziffern) implements Zahlungsart {}
    record Rechnung(int zahlungszielTage) implements Zahlungsart {}
    record Gutschein(BigDecimal wert) implements Zahlungsart {}

    // Streams: filtern, sortieren, abbilden
    static List<String> teureArtikel(List<Position> positionen, BigDecimal abSumme) {
        return positionen.stream()
            .filter(p -> p.summe().compareTo(abSumme) >= 0)
            .sorted(Comparator.comparing(Position::summe).reversed())
            .map(Position::artikel)
            .toList();
    }

    // Streams: gruppieren und summieren
    static Map<String, BigDecimal> umsatzJeKategorie(List<Position> positionen) {
        return positionen.stream()
            .collect(Collectors.groupingBy(Position::kategorie,
                Collectors.reducing(BigDecimal.ZERO, Position::summe, BigDecimal::add)));
    }

    // Null-Behandlung mit Optional
    static String anzeigename(String vorname, String nachname) {
        var v = Optional.ofNullable(vorname).map(String::trim).filter(s -> !s.isEmpty());
        var n = Optional.ofNullable(nachname).map(String::trim).filter(s -> !s.isEmpty());
        if (v.isPresent() && n.isPresent()) return v.get() + " " + n.get();
        return n.orElse("Gast");
    }

    // switch mit Musterabgleich (Java 21) – vollständig, weil Zahlungsart sealed ist
    static String beschreibung(Zahlungsart zahlungsart) {
        return switch (zahlungsart) {
            case Kreditkarte k -> "Kreditkarte **** " + k.endziffern();
            case Rechnung r when r.zahlungszielTage() > 30 ->
                "Rechnung, " + r.zahlungszielTage() + " Tage (Freigabe nötig)";
            case Rechnung r -> "Rechnung, " + r.zahlungszielTage() + " Tage";
            case Gutschein g -> String.format(Locale.GERMANY, "Gutschein über %.2f €", g.wert());
        };
    }

    // ------------------------------------------------------------------ Selbstprüfung
    private static int fehler = 0;

    private static void pruefe(String beschreibung, Object ist, Object erwartet) {
        boolean ok = ist instanceof BigDecimal a && erwartet instanceof BigDecimal b
            ? a.compareTo(b) == 0
            : Objects.equals(ist, erwartet);
        System.out.println((ok ? "OK     " : "FEHLER ") + beschreibung + (ok ? "" : " – ist: " + ist + ", erwartet: " + erwartet));
        if (!ok) fehler++;
    }

    public static void main(String[] args) {
        var positionen = List.of(
            new Position("Buch", "Medien", 2, new BigDecimal("24.90")),
            new Position("Monitor", "Technik", 1, new BigDecimal("349.00")),
            new Position("Kabel", "Technik", 3, new BigDecimal("9.99")),
            new Position("Tasse", "Haushalt", 1, new BigDecimal("12.50")));

        pruefe("teureArtikel", teureArtikel(positionen, new BigDecimal("25")), List.of("Monitor", "Buch", "Kabel"));

        var umsatz = umsatzJeKategorie(positionen);
        pruefe("Umsatz Technik", umsatz.get("Technik"), new BigDecimal("378.97"));
        pruefe("Umsatz Medien", umsatz.get("Medien"), new BigDecimal("49.80"));
        pruefe("Anzahl Kategorien", umsatz.size(), 3);

        pruefe("anzeigename voll", anzeigename("Anna", "Beispiel"), "Anna Beispiel");
        pruefe("anzeigename ohne Vorname", anzeigename(null, "Beispiel"), "Beispiel");
        pruefe("anzeigename leer", anzeigename("  ", null), "Gast");

        pruefe("Kreditkarte", beschreibung(new Kreditkarte("4242")), "Kreditkarte **** 4242");
        pruefe("Rechnung 14", beschreibung(new Rechnung(14)), "Rechnung, 14 Tage");
        pruefe("Rechnung 60", beschreibung(new Rechnung(60)), "Rechnung, 60 Tage (Freigabe nötig)");
        pruefe("Gutschein", beschreibung(new Gutschein(new BigDecimal("25"))), "Gutschein über 25,00 €");

        System.out.println(fehler == 0 ? "Alle Prüfungen bestanden." : fehler + " Prüfung(en) fehlgeschlagen.");
        System.exit(fehler == 0 ? 0 : 1);
    }
}
