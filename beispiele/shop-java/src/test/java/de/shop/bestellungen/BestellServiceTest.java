package de.shop.bestellungen;

import de.shop.preise.Rabattrechner;
import de.shop.testdaten.TestProdukte;
import de.shop.zahlung.Zahlungsdienst;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static de.shop.testdaten.WarenkorbBuilder.einWarenkorb;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)   // erzeugt die @Mock-Felder für JEDEN Test neu
class BestellServiceTest {

    private static final Kunde MAX = new Kunde("Max", false);
    private static final Kunde STAMMKUNDIN = new Kunde("Anna", true);

    @Mock
    private Zahlungsdienst zahlung;
    @Mock
    private BestellRepository repository;

    private BestellService service;

    @BeforeEach
    void vorbereiten() {
        var uhr = Clock.fixed(Instant.parse("2026-03-15T10:00:00Z"), ZoneOffset.UTC);
        service = new BestellService(new Rabattrechner(), zahlung, repository, uhr);
    }

    @Test
    void bestellenMitGenehmigterZahlungSpeichertBestellung() {
        when(zahlung.abbuchen(anyString(), any())).thenReturn(true);
        var warenkorb = einWarenkorb().mit(TestProdukte.BUCH).bauen();

        var ergebnis = service.bestellen(warenkorb, MAX);

        assertThat(ergebnis.erfolgreich()).isTrue();
        verify(repository).speichern(ergebnis.bestellung());
    }

    @Test
    void bestellenBuchtDenRabattiertenEndpreisAb() {
        when(zahlung.abbuchen(anyString(), any())).thenReturn(true);
        var warenkorb = einWarenkorb().mitWert("200").bauen();   // 200 € - 15 % = 170 €

        service.bestellen(warenkorb, STAMMKUNDIN);

        verify(zahlung).abbuchen(eq("Anna"), argThat(betrag -> betrag.compareTo(new BigDecimal("170")) == 0));
    }

    @Test
    void bestellenBeiAbgelehnterZahlungSpeichertNichts() {
        when(zahlung.abbuchen(anyString(), any())).thenReturn(false);
        var warenkorb = einWarenkorb().mit(TestProdukte.MONITOR).bauen();

        var ergebnis = service.bestellen(warenkorb, MAX);

        assertThat(ergebnis.erfolgreich()).isFalse();
        assertThat(ergebnis.fehler()).contains("abgelehnt");
        verifyNoInteractions(repository);
    }

    @Test
    void bestellenMitLeeremWarenkorbWirftException() {
        var leer = einWarenkorb().bauen();

        assertThatThrownBy(() -> service.bestellen(leer, MAX)).isInstanceOf(IllegalStateException.class);
        verifyNoInteractions(zahlung);
    }

    // Ergänzt, nachdem die Abdeckungsmessung gezeigt hat, dass dieser Zweig ungetestet war.
    @ParameterizedTest
    @ValueSource(strings = {"", "   "})
    void bestellenOhneKundennamenWirftException(String name) {
        var warenkorb = einWarenkorb().mit(TestProdukte.BUCH).bauen();

        assertThatThrownBy(() -> service.bestellen(warenkorb, new Kunde(name, false)))
            .isInstanceOf(IllegalArgumentException.class);
        verifyNoInteractions(zahlung);
    }

    @Test
    void bestellnummerEnthaeltDasBestelldatum() {
        when(zahlung.abbuchen(anyString(), any())).thenReturn(true);
        var warenkorb = einWarenkorb().mit(TestProdukte.TASSE).bauen();

        var ergebnis = service.bestellen(warenkorb, MAX);

        assertThat(ergebnis.bestellung().bestellnummer()).startsWith("B-20260315-");
    }
}
