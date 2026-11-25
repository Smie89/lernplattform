using System.Collections.Concurrent;

namespace Shop.Core.Bestellungen;

public sealed class InMemoryBestellRepository : IBestellRepository
{
    private readonly ConcurrentDictionary<string, Bestellung> _bestellungen = new();

    public void Speichern(Bestellung bestellung) => _bestellungen[bestellung.Bestellnummer] = bestellung;

    public Bestellung? Finde(string bestellnummer) => _bestellungen.GetValueOrDefault(bestellnummer);
}
