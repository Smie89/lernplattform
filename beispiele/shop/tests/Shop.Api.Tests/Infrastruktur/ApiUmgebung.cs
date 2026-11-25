using Microsoft.AspNetCore.Mvc.Testing;

// Bewusst im Wurzel-Namespace des Testprojekts: NUnit führt einen [SetUpFixture]
// einmal für alle Tests in seinem Namespace (und darunter) aus.
namespace Shop.Api.Tests;

/// <summary>
/// Startet die Anwendung einmal für alle API-Tests – im Arbeitsspeicher, ohne echten Port.
/// </summary>
[SetUpFixture]
public class ApiUmgebung
{
    public static WebApplicationFactory<Program> Anwendung { get; private set; } = null!;

    [OneTimeSetUp]
    public void Starten() => Anwendung = new WebApplicationFactory<Program>();

    [OneTimeTearDown]
    public void Beenden() => Anwendung.Dispose();
}
