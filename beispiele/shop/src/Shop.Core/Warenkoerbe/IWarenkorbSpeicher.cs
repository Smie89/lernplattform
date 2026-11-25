namespace Shop.Core.Warenkoerbe;

public interface IWarenkorbSpeicher
{
    Warenkorb Neu();
    Warenkorb? Finde(Guid id);
    void Entfernen(Guid id);
}
