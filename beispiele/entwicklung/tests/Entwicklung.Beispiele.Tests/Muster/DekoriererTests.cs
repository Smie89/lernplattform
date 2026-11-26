using Entwicklung.Beispiele.Muster.Dekorierer;

namespace Entwicklung.Beispiele.Tests.Muster;

public class DekoriererTests
{
    /// <summary>Fake: lehnt die ersten n Versuche ab, danach genehmigt er.</summary>
    private sealed class WackelnderZahlungsdienst(int fehlversuche) : IZahlungsdienst
    {
        public int Aufrufe { get; private set; }

        public bool Abbuchen(string kunde, decimal betrag) => ++Aufrufe > fehlversuche;
    }

    [Test]
    public void Protokollierender_Dekorierer_ergaenzt_Verhalten()
    {
        var protokoll = new List<string>();
        var dienst = new ProtokollierenderZahlungsdienst(new WackelnderZahlungsdienst(0), protokoll.Add);

        var ok = dienst.Abbuchen("Max", 19.90m);

        Assert.That(ok, Is.True);
        Assert.That(protokoll, Has.Count.EqualTo(2));
        Assert.That(protokoll[1], Is.EqualTo("... genehmigt"));
    }

    [Test]
    public void Dekorierer_lassen_sich_verketten()
    {
        var protokoll = new List<string>();
        var basis = new WackelnderZahlungsdienst(fehlversuche: 2);
        IZahlungsdienst dienst = new ProtokollierenderZahlungsdienst(
            new WiederholenderZahlungsdienst(basis, versuche: 3), protokoll.Add);

        var ok = dienst.Abbuchen("Max", 19.90m);

        Assert.That(ok, Is.True);
        Assert.That(basis.Aufrufe, Is.EqualTo(3));
    }
}
