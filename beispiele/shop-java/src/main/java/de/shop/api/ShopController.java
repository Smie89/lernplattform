package de.shop.api;

import de.shop.api.Vertraege.BestellAnfrage;
import de.shop.api.Vertraege.BestellAntwort;
import de.shop.api.Vertraege.PositionAnfrage;
import de.shop.api.Vertraege.WarenkorbAntwort;
import de.shop.bestellungen.BestellErgebnis;
import de.shop.bestellungen.BestellRepository;
import de.shop.bestellungen.BestellService;
import de.shop.bestellungen.Kunde;
import de.shop.katalog.Produkt;
import de.shop.katalog.ProduktKatalog;
import de.shop.preise.Rabattrechner;
import de.shop.warenkoerbe.Warenkorb;
import de.shop.warenkoerbe.WarenkorbSpeicher;
import org.springframework.http.HttpStatus;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class ShopController {

    private final ProduktKatalog katalog;
    private final WarenkorbSpeicher speicher;
    private final Rabattrechner rabatt;
    private final BestellService bestellService;
    private final BestellRepository bestellungen;

    public ShopController(ProduktKatalog katalog, WarenkorbSpeicher speicher, Rabattrechner rabatt,
                          BestellService bestellService, BestellRepository bestellungen) {
        this.katalog = katalog;
        this.speicher = speicher;
        this.rabatt = rabatt;
        this.bestellService = bestellService;
        this.bestellungen = bestellungen;
    }

    @GetMapping("/produkte")
    public List<Produkt> produkte() {
        return katalog.alle();
    }

    @PostMapping("/warenkoerbe")
    public ResponseEntity<WarenkorbAntwort> neuerWarenkorb() {
        var w = speicher.neu();
        return ResponseEntity.created(URI.create("/api/warenkoerbe/" + w.id()))
            .body(WarenkorbAntwort.von(w, rabatt, false));
    }

    @GetMapping("/warenkoerbe/{id}")
    public ResponseEntity<?> warenkorb(@PathVariable UUID id,
                                       @RequestParam(defaultValue = "false") boolean stammkunde) {
        return speicher.finde(id)
            .<ResponseEntity<?>>map(w -> ResponseEntity.ok(WarenkorbAntwort.von(w, rabatt, stammkunde)))
            .orElseGet(() -> problem(HttpStatus.NOT_FOUND, "Warenkorb nicht gefunden."));
    }

    @PostMapping("/warenkoerbe/{id}/positionen")
    public ResponseEntity<?> hinzufuegen(@PathVariable UUID id, @RequestBody PositionAnfrage anfrage) {
        Warenkorb w = speicher.finde(id).orElse(null);
        if (w == null) return problem(HttpStatus.NOT_FOUND, "Warenkorb nicht gefunden.");

        var produkt = katalog.finde(anfrage.produktId()).orElse(null);
        if (produkt == null) {
            return problem(HttpStatus.BAD_REQUEST, "Unbekanntes Produkt '" + anfrage.produktId() + "'.");
        }

        try {
            w.hinzufuegen(produkt, anfrage.menge());
        } catch (IllegalArgumentException e) {
            return problem(HttpStatus.BAD_REQUEST, e.getMessage());
        }
        return ResponseEntity.ok(WarenkorbAntwort.von(w, rabatt, false));
    }

    @DeleteMapping("/warenkoerbe/{id}/positionen/{produktId}")
    public ResponseEntity<?> entfernen(@PathVariable UUID id, @PathVariable String produktId) {
        Warenkorb w = speicher.finde(id).orElse(null);
        if (w == null) return problem(HttpStatus.NOT_FOUND, "Warenkorb nicht gefunden.");
        w.entfernen(produktId);
        return ResponseEntity.ok(WarenkorbAntwort.von(w, rabatt, false));
    }

    @PostMapping("/warenkoerbe/{id}/bestellung")
    public ResponseEntity<?> bestellen(@PathVariable UUID id, @RequestBody BestellAnfrage anfrage) {
        Warenkorb w = speicher.finde(id).orElse(null);
        if (w == null) return problem(HttpStatus.NOT_FOUND, "Warenkorb nicht gefunden.");

        BestellErgebnis ergebnis;
        // SHOP-1: Prüfen, bestellen und entfernen muss pro Warenkorb atomar sein.
        // Sonst kommen gleichzeitige Requests (Doppelklick) alle durch und erzeugen mehrere Bestellungen.
        synchronized (w) {
            if (speicher.finde(id).isEmpty()) return problem(HttpStatus.NOT_FOUND, "Warenkorb nicht gefunden.");
            if (w.istLeer()) return problem(HttpStatus.BAD_REQUEST, "Der Warenkorb ist leer.");
            if (anfrage.kundenName() == null || anfrage.kundenName().isBlank()) {
                return problem(HttpStatus.BAD_REQUEST, "Bitte einen Namen angeben.");
            }

            ergebnis = bestellService.bestellen(w, new Kunde(anfrage.kundenName().trim(), anfrage.stammkunde()));
            if (ergebnis.erfolgreich()) speicher.entfernen(id);
        }

        if (!ergebnis.erfolgreich()) return problem(HttpStatus.UNPROCESSABLE_CONTENT, ergebnis.fehler());
        var b = ergebnis.bestellung();
        return ResponseEntity.created(URI.create("/api/bestellungen/" + b.bestellnummer()))
            .body(new BestellAntwort(b.bestellnummer(), b.kunde().name(), b.zwischensumme(), b.endpreis()));
    }

    @GetMapping("/bestellungen/{nummer}")
    public ResponseEntity<?> bestellung(@PathVariable String nummer) {
        return bestellungen.finde(nummer)
            .<ResponseEntity<?>>map(b -> ResponseEntity.ok(
                new BestellAntwort(b.bestellnummer(), b.kunde().name(), b.zwischensumme(), b.endpreis())))
            .orElseGet(() -> problem(HttpStatus.NOT_FOUND, "Bestellung nicht gefunden."));
    }

    private static ResponseEntity<ProblemDetail> problem(HttpStatus status, String detail) {
        return ResponseEntity.status(status).body(ProblemDetail.forStatusAndDetail(status, detail));
    }
}
