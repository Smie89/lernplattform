package de.shop.bestellungen;

public record BestellErgebnis(boolean erfolgreich, Bestellung bestellung, String fehler) {

    public static BestellErgebnis ok(Bestellung bestellung) {
        return new BestellErgebnis(true, bestellung, null);
    }

    public static BestellErgebnis abgelehnt(String fehler) {
        return new BestellErgebnis(false, null, fehler);
    }
}
