namespace Shop.Core.Zahlung;

public interface IZahlungsdienst
{
    /// <returns>true, wenn der Betrag abgebucht werden konnte.</returns>
    bool Abbuchen(string kundenName, decimal betrag);
}
