namespace Shop.Core.Bestellungen;

public interface IBestellRepository
{
    void Speichern(Bestellung bestellung);
    Bestellung? Finde(string bestellnummer);
}
