namespace Shop.Core.Katalog;

public interface IProduktKatalog
{
    IReadOnlyList<Produkt> Alle();
    Produkt? Finde(string id);
}
