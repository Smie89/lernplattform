package de.lernplattform.minishop;

import android.app.Activity;
import android.app.AlertDialog;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.TextView;

import java.math.BigDecimal;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;
import java.util.Random;

/** Eine Seite: Produkte, Warenkorb, Bestellung. Bewusst schlicht – im Mittelpunkt stehen die Tests. */
public class MainActivity extends Activity {

    private static final String ZUSTAND_MENGEN = "mengen";

    private Warenkorb warenkorb;
    private final TextView[] mengenAnzeigen = new TextView[Warenkorb.KATALOG.size()];
    private TextView zwischensumme;
    private TextView rabatt;
    private TextView endpreis;
    private TextView fehler;
    private CheckBox stammkunde;
    private EditText kundenname;

    @Override
    protected void onCreate(Bundle gespeichert) {
        super.onCreate(gespeichert);
        setContentView(R.layout.activity_main);

        // Beim Drehen baut Android die Activity neu auf. Ohne diese Zeile wäre der Warenkorb danach leer –
        // ein klassischer Fehler in mobilen Apps (siehe test_zustand.py).
        int[] mengen = gespeichert != null ? gespeichert.getIntArray(ZUSTAND_MENGEN) : null;
        warenkorb = mengen != null ? new Warenkorb(mengen) : new Warenkorb();

        zwischensumme = findViewById(R.id.zwischensumme);
        rabatt = findViewById(R.id.rabatt);
        endpreis = findViewById(R.id.endpreis);
        fehler = findViewById(R.id.fehler);
        stammkunde = findViewById(R.id.stammkunde);
        kundenname = findViewById(R.id.kundenname);

        LinearLayout liste = findViewById(R.id.produkte);
        LayoutInflater inflater = LayoutInflater.from(this);
        for (int i = 0; i < Warenkorb.KATALOG.size(); i++) {
            Warenkorb.Produkt produkt = Warenkorb.KATALOG.get(i);
            View zeile = inflater.inflate(R.layout.zeile_produkt, liste, false);
            zeile.setContentDescription("Produkt " + produkt.name());   // Accessibility ID für Appium und Screenreader
            ((TextView) zeile.findViewById(R.id.name)).setText(produkt.name());
            ((TextView) zeile.findViewById(R.id.preis)).setText(euro(produkt.preis()));
            mengenAnzeigen[i] = zeile.findViewById(R.id.menge);
            Button knopf = zeile.findViewById(R.id.hinzufuegen);
            knopf.setContentDescription(produkt.name() + " in den Warenkorb");
            final int index = i;
            knopf.setOnClickListener(v -> {
                fehler.setText("");
                try {
                    warenkorb.hinzufuegen(index);
                } catch (IllegalStateException e) {
                    fehler.setText(e.getMessage());
                }
                aktualisieren();
            });
            liste.addView(zeile);
        }

        stammkunde.setOnCheckedChangeListener((v, an) -> aktualisieren());
        findViewById(R.id.bestellen).setOnClickListener(v -> bestellen());
        aktualisieren();
    }

    @Override
    protected void onSaveInstanceState(Bundle zustand) {
        super.onSaveInstanceState(zustand);
        zustand.putIntArray(ZUSTAND_MENGEN, warenkorb.mengen());
    }

    @Override
    protected void onRestoreInstanceState(Bundle zustand) {
        super.onRestoreInstanceState(zustand);   // stellt auch Checkbox und Namensfeld wieder her
        aktualisieren();
    }

    private void aktualisieren() {
        for (int i = 0; i < mengenAnzeigen.length; i++) {
            mengenAnzeigen[i].setText(String.valueOf(warenkorb.menge(i)));
        }
        BigDecimal summe = warenkorb.zwischensumme();
        BigDecimal satz = Warenkorb.rabattSatz(summe, stammkunde.isChecked());
        zwischensumme.setText(getString(R.string.zwischensumme) + ": " + euro(summe));
        rabatt.setText(getString(R.string.rabatt) + ": " + satz.movePointRight(2).stripTrailingZeros().toPlainString() + " %");
        endpreis.setText(getString(R.string.endpreis) + ": " + euro(warenkorb.endpreis(stammkunde.isChecked())));
    }

    private void bestellen() {
        String name = kundenname.getText().toString().trim();
        if (warenkorb.istLeer()) {
            fehler.setText("Der Warenkorb ist leer.");
            return;
        }
        if (name.isEmpty()) {
            fehler.setText("Bitte einen Namen angeben.");
            return;
        }
        BigDecimal betrag = warenkorb.endpreis(stammkunde.isChecked());
        if (betrag.compareTo(Warenkorb.ZAHLUNGSLIMIT) > 0) {
            fehler.setText("Die Zahlung wurde abgelehnt.");
            return;
        }
        fehler.setText("");
        String nummer = "B-" + new SimpleDateFormat("yyyyMMdd", Locale.GERMANY).format(new Date())
                + "-" + (1000 + new Random().nextInt(9000));
        warenkorb.leeren();
        aktualisieren();
        new AlertDialog.Builder(this)
                .setTitle("Bestellung aufgenommen")
                .setMessage("Bestellung " + nummer + " für " + name + " über " + euro(betrag))
                .setPositiveButton("OK", null)
                .show();
    }

    static String euro(BigDecimal betrag) {
        return String.format(Locale.GERMANY, "%,.2f €", betrag);
    }
}
