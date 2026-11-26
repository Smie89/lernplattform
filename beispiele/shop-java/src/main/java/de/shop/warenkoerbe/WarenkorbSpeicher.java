package de.shop.warenkoerbe;

import java.util.Optional;
import java.util.UUID;

public interface WarenkorbSpeicher {
    Warenkorb neu();

    Optional<Warenkorb> finde(UUID id);

    void entfernen(UUID id);
}
