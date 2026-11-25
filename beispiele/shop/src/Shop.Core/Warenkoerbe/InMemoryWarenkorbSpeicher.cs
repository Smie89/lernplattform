using System.Collections.Concurrent;

namespace Shop.Core.Warenkoerbe;

public sealed class InMemoryWarenkorbSpeicher : IWarenkorbSpeicher
{
    private readonly ConcurrentDictionary<Guid, Warenkorb> _warenkoerbe = new();

    public Warenkorb Neu()
    {
        var warenkorb = new Warenkorb();
        _warenkoerbe[warenkorb.Id] = warenkorb;
        return warenkorb;
    }

    public Warenkorb? Finde(Guid id) => _warenkoerbe.GetValueOrDefault(id);

    public void Entfernen(Guid id) => _warenkoerbe.TryRemove(id, out _);
}
