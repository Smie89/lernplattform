using Shop.Core.Bestellungen;
using Shop.Core.Katalog;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Shop.Core.Preise;
using Shop.Core.Telemetrie;
using Shop.Core.Warenkoerbe;
using Shop.Core.Zahlung;
using Shop.Web.Api;

var builder = WebApplication.CreateBuilder(args);

// Befund aus dem Header-Check: Der Server-Header verriet "Kestrel".
builder.WebHost.ConfigureKestrel(optionen => optionen.AddServerHeader = false);

builder.Services.AddSingleton<IProduktKatalog, InMemoryProduktKatalog>();
builder.Services.AddSingleton<IWarenkorbSpeicher, InMemoryWarenkorbSpeicher>();
builder.Services.AddSingleton<IBestellRepository, InMemoryBestellRepository>();
builder.Services.AddSingleton<IZahlungsdienst, DemoZahlungsdienst>();
builder.Services.AddSingleton<Rabattrechner>();
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton<BestellService>();
builder.Services.AddOpenApi();   // beschreibt die API maschinenlesbar unter /openapi/v1.json

// Observability (Lektion "Observability"): Traces und Metriken mit OpenTelemetry.
// - Traces: jede Anfrage automatisch, dazu eigene Spans aus Shop.Core ("Bestellung aufgeben").
//   Exportiert per OTLP, aber nur, wenn ein Empfänger konfiguriert ist (OTEL_EXPORTER_OTLP_ENDPOINT, z. B. Jaeger).
// - Metriken: Anfragen (Dauer, Statuscodes), Laufzeit (GC, Threads) und eigene Zähler – abrufbar unter /metrics.
var otlpEndpunkt = builder.Configuration["OTEL_EXPORTER_OTLP_ENDPOINT"];
builder.Services.AddOpenTelemetry()
    .ConfigureResource(ressource => ressource.AddService(builder.Configuration["OTEL_SERVICE_NAME"] ?? "mini-shop"))
    .WithTracing(traces =>
    {
        traces.AddAspNetCoreInstrumentation()
              .AddHttpClientInstrumentation()
              .AddSource(ShopTelemetrie.Name);
        if (!string.IsNullOrEmpty(otlpEndpunkt)) traces.AddOtlpExporter();
    })
    .WithMetrics(metriken => metriken
        .AddAspNetCoreInstrumentation()
        .AddRuntimeInstrumentation()
        .AddMeter(ShopTelemetrie.Name)
        .AddPrometheusExporter());

var app = builder.Build();

// Sicherheits-Header für alle Antworten – behebt die Befunde des Header-Checks
// (beispiele/security/header_check.py, Lektion "Web-Pentesting" im Bereich Cybersecurity).
app.Use(async (kontext, weiter) =>
{
    var header = kontext.Response.Headers;
    header["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";
    header["X-Content-Type-Options"] = "nosniff";
    header["X-Frame-Options"] = "DENY";
    header["Referrer-Policy"] = "no-referrer";
    await weiter();
});

app.UseDefaultFiles();   // liefert wwwroot/index.html für "/"
app.UseStaticFiles();
app.MapOpenApi();
app.MapShopApi();        // alle Endpunkte unter /api, siehe Api/ShopApi.cs
app.MapPrometheusScrapingEndpoint();   // /metrics im Textformat von Prometheus

app.Run();

// Macht die Klasse für WebApplicationFactory<Program> in den Testprojekten sichtbar.
public partial class Program;
