using Shop.Core.Bestellungen;
using Shop.Core.Katalog;
using Shop.Core.Preise;
using Shop.Core.Warenkoerbe;
using Shop.Core.Zahlung;
using Shop.Web.Api;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<IProduktKatalog, InMemoryProduktKatalog>();
builder.Services.AddSingleton<IWarenkorbSpeicher, InMemoryWarenkorbSpeicher>();
builder.Services.AddSingleton<IBestellRepository, InMemoryBestellRepository>();
builder.Services.AddSingleton<IZahlungsdienst, DemoZahlungsdienst>();
builder.Services.AddSingleton<Rabattrechner>();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton<BestellService>();

var app = builder.Build();

app.UseDefaultFiles();   // liefert wwwroot/index.html für "/"
app.UseStaticFiles();
app.MapShopApi();        // alle Endpunkte unter /api, siehe Api/ShopApi.cs

app.Run();

// Macht die Klasse für WebApplicationFactory<Program> in den Testprojekten sichtbar.
public partial class Program;
