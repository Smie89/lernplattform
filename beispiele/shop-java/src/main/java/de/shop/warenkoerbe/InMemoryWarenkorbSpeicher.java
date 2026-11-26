package de.shop.warenkoerbe;

import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class InMemoryWarenkorbSpeicher implements WarenkorbSpeicher {

    private final Map<UUID, Warenkorb> warenkoerbe = new ConcurrentHashMap<>();

    @Override
    public Warenkorb neu() {
        var warenkorb = new Warenkorb();
        warenkoerbe.put(warenkorb.id(), warenkorb);
        return warenkorb;
    }

    @Override
    public Optional<Warenkorb> finde(UUID id) {
        return Optional.ofNullable(warenkoerbe.get(id));
    }

    @Override
    public void entfernen(UUID id) {
        warenkoerbe.remove(id);
    }
}
