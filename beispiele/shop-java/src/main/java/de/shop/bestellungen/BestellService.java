package de.shop.bestellungen;

import de.shop.preise.Rabattrechner;
import de.shop.warenkoerbe.Warenkorb;
import de.shop.zahlung.Zahlungsdienst;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
public class BestellService {

    private static final DateTimeFormatter DATUM = DateTimeFormatter.ofPattern("yyyyMMdd").withZone(ZoneOffset.UTC);

    private final Rabattrechner rabattrechner;
    private final Zahlungsdienst zahlungsdienst;
    private final BestellRepository repository;
    private final Clock uhr;

    public BestellService(Rabattrechner rabattrechner, Zahlungsdienst zahlungsdienst,
                          BestellRepository repository, Clock uhr) {
        this.rabattrechner = rabattrechner;
        this.zahlungsdienst = zahlungsdienst;
        this.repository = repository;
        this.uhr = uhr;
    }

    public BestellErgebnis bestellen(Warenkorb warenkorb, Kunde kunde) {
        if (warenkorb.istLeer()) {
            throw new IllegalStateException("Ein leerer Warenkorb kann nicht bestellt werden.");
        }
        if (kunde.name() == null || kunde.name().isBlank()) {
            throw new IllegalArgumentException("Der Name des Kunden fehlt.");
        }

        var endpreis = rabattrechner.endpreis(warenkorb.zwischensumme(), kunde.istStammkunde());

        if (!zahlungsdienst.abbuchen(kunde.name(), endpreis)) {
            return BestellErgebnis.abgelehnt("Die Zahlung wurde abgelehnt.");
        }

        var jetzt = uhr.instant();
        var nummer = "B-" + DATUM.format(jetzt) + "-"
            + UUID.randomUUID().toString().substring(0, 6).toUpperCase(Locale.ROOT);
        var bestellung = new Bestellung(nummer, kunde, List.copyOf(warenkorb.positionen()),
            warenkorb.zwischensumme(), endpreis, jetzt);

        repository.speichern(bestellung);
        return BestellErgebnis.ok(bestellung);
    }
}
