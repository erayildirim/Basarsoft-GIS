using Microsoft.EntityFrameworkCore;
using NetTopologySuite;
using NetTopologySuite.IO;
using ModelLine = Basarsoft.Models.Line;
using ModelPoint = Basarsoft.Models.Point;
using ModelPolygon = Basarsoft.Models.Polygon;

namespace Basarsoft.Data
{
    /// <summary>
    /// Inserts a small set of sample geometries (Turkish landmarks) into an empty database
    /// so a fresh deployment does not start with a blank map.
    /// Enabled with the <c>Database:SeedDemoData</c> setting.
    /// </summary>
    public static class DemoDataSeeder
    {
        private static readonly (string Name, string Wkt)[] Points =
        {
            ("Anıtkabir", "POINT(32.8369 39.9250)"),
            ("Galata Tower", "POINT(28.9742 41.0256)"),
            ("Hagia Sophia", "POINT(28.9802 41.0086)"),
            ("Topkapı Palace", "POINT(28.9834 41.0115)"),
            ("Göreme Open-Air Museum", "POINT(34.8459 38.6400)"),
            ("Pamukkale Travertines", "POINT(29.1203 37.9204)"),
            ("Ephesus Ancient City", "POINT(27.3419 37.9411)"),
            ("Sumela Monastery", "POINT(39.6584 40.6901)"),
            ("Mount Nemrut", "POINT(38.7405 37.9809)"),
            ("Bodrum Castle", "POINT(27.4289 37.0319)"),
        };

        private static readonly (string Name, string Wkt)[] Lines =
        {
            ("Istanbul – Ankara High-Speed Rail",
             "LINESTRING(29.0340 40.9900, 29.9408 40.7654, 30.4000 40.4500, 30.5206 39.7767, 31.6000 39.6500, 32.8597 39.9334)"),
            ("Ankara – Kayseri Highway",
             "LINESTRING(32.8597 39.9334, 33.5153 39.8468, 34.2000 39.3500, 35.4826 38.7205)"),
            ("Aegean Coastal Route",
             "LINESTRING(27.1428 38.4237, 27.2610 37.8579, 27.3500 37.5000, 27.4305 37.0344)"),
        };

        private static readonly (string Name, string Wkt)[] Polygons =
        {
            ("Lake Tuz",
             "POLYGON((33.20 38.95, 33.45 39.05, 33.62 38.85, 33.55 38.55, 33.35 38.45, 33.18 38.65, 33.20 38.95))"),
            ("Cappadocia Region",
             "POLYGON((34.70 38.75, 35.00 38.75, 35.00 38.55, 34.70 38.55, 34.70 38.75))"),
            ("Istanbul Historic Peninsula",
             "POLYGON((28.9300 41.0180, 28.9700 41.0200, 28.9880 41.0160, 28.9850 41.0040, 28.9550 41.0000, 28.9300 41.0050, 28.9300 41.0180))"),
            ("Lake Van",
             "POLYGON((42.35 38.90, 42.75 38.95, 43.10 38.80, 43.30 38.55, 43.05 38.35, 42.70 38.45, 42.40 38.65, 42.35 38.90))"),
        };

        public static async Task SeedAsync(ApplicationDbContext db, ILogger logger)
        {
            if (await db.Points.AnyAsync() || await db.Lines.AnyAsync() || await db.Polygons.AnyAsync())
                return;

            var reader = new WKTReader(NtsGeometryServices.Instance);
            T Read<T>(string wkt) where T : NetTopologySuite.Geometries.Geometry
            {
                var g = (T)reader.Read(wkt);
                g.SRID = 4326;
                return g;
            }

            db.Points.AddRange(Points.Select(p => new ModelPoint
            {
                Name = p.Name,
                Location = Read<NetTopologySuite.Geometries.Point>(p.Wkt)
            }));
            db.Lines.AddRange(Lines.Select(l => new ModelLine
            {
                Name = l.Name,
                Location = Read<NetTopologySuite.Geometries.LineString>(l.Wkt)
            }));
            db.Polygons.AddRange(Polygons.Select(p => new ModelPolygon
            {
                Name = p.Name,
                Location = Read<NetTopologySuite.Geometries.Polygon>(p.Wkt)
            }));

            await db.SaveChangesAsync();
            logger.LogInformation("Seeded demo data: {Points} points, {Lines} lines, {Polygons} polygons",
                Points.Length, Lines.Length, Polygons.Length);
        }
    }
}
