using System.Globalization;
using Basarsoft;
using Basarsoft.Data;
using Basarsoft.Interfaces;
using Basarsoft.Repositories.Implementations;
using Basarsoft.Repositories.Interfaces;
using Basarsoft.Services;
using Microsoft.EntityFrameworkCore;

// Coordinates are formatted/parsed as text (WKT). Use the invariant culture so that
// machines with e.g. a Turkish locale don't write "29,01" instead of "29.01".
CultureInfo.DefaultThreadCurrentCulture = CultureInfo.InvariantCulture;
CultureInfo.DefaultThreadCurrentUICulture = CultureInfo.InvariantCulture;

var builder = WebApplication.CreateBuilder(args);

// Hosting platforms such as Render tell the app which port to listen on via $PORT.
var port = Environment.GetEnvironmentVariable("PORT");
if (!string.IsNullOrWhiteSpace(port))
{
    builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
}

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Basarsoft GIS API",
        Version = "v1",
        Description = "CRUD, paging and search for points, lines and polygons stored in PostgreSQL/PostGIS. " +
                      "Geometries are exchanged as WKT in WGS84 (EPSG:4326), coordinates in \"lon lat\" order."
    });
});

// Logging configuration
builder.Services.AddLogging(config =>
{
    config.AddConsole();
    config.AddDebug();
    config.SetMinimumLevel(LogLevel.Information);
});

// CORS is only needed when the React app is served from a different origin
// (e.g. the CRA dev server). Origins can be configured with Cors:AllowedOrigins.
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
                     ?? new[] { "http://localhost:7269", "http://localhost:3000" };

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Database configuration
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(ConnectionStringResolver.Resolve(builder.Configuration),
        o => o.UseNetTopologySuite());
});

// Repository registrations
builder.Services.AddScoped<IPointRepository, PointRepository>();
builder.Services.AddScoped<ILineRepository, LineRepository>();
builder.Services.AddScoped<IPolygonRepository, PolygonRepository>();

// Generic repository registrations
builder.Services.AddScoped<IRepository<Basarsoft.Models.Point>, PointRepository>();
builder.Services.AddScoped<IRepository<Basarsoft.Models.Line>, LineRepository>();
builder.Services.AddScoped<IRepository<Basarsoft.Models.Polygon>, PolygonRepository>();

// Service registrations
builder.Services.AddScoped<IPointService, PointService>();
builder.Services.AddScoped<ILineService, LineService>();
builder.Services.AddScoped<IPolygonService, PolygonService>();
builder.Services.AddScoped<ISearchService, SearchService>();

// Unit of Work
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();

var app = builder.Build();

// Apply pending EF Core migrations (creates the PostGIS extension and tables on a fresh
// database) and optionally insert sample data.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    if (app.Configuration.GetValue("Database:MigrateOnStartup", true))
    {
        await db.Database.MigrateAsync();
    }

    if (app.Configuration.GetValue("Database:SeedDemoData", false))
    {
        await DemoDataSeeder.SeedAsync(db, logger);
    }
}

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

// Use CORS
app.UseCors("AllowReactApp");

app.UseAuthorization();

// Serve the production React build (copied to wwwroot by the Dockerfile).
app.UseDefaultFiles();
app.UseStaticFiles();

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

app.MapControllers();

app.Run();
