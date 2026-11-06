using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;
using NetTopologySuite;

namespace Basarsoft.Dtos
{
    public class PolygonCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Wkt { get; set; } = string.Empty;

        // Computed from Wkt; excluded from JSON and from MVC model validation
        // (otherwise validation evaluates the getter and an invalid WKT becomes an unhandled 500).
        [JsonIgnore]
        [ValidateNever]
        public NetTopologySuite.Geometries.Polygon Geometry
        {
            get
            {
                try
                {
                    if (string.IsNullOrWhiteSpace(Wkt))
                        throw new ArgumentException("WKT cannot be empty.");

                    var reader = new WKTReader(NtsGeometryServices.Instance);
                    var geom = reader.Read(Wkt.Trim());

                    if (geom is NetTopologySuite.Geometries.Polygon pg)
                    {
                        if (!pg.IsValid)
                            throw new ArgumentException("Polygon geometry is invalid (e.g. self-intersecting).");

                        if (pg.ExteriorRing?.NumPoints < 4)
                            throw new ArgumentException("A polygon must contain at least 4 points (first and last point must be the same).");

                        pg.SRID = 4326;
                        return pg;
                    }
                    throw new ArgumentException($"WKT is not a valid Polygon. Geometry type: {geom?.GetType().Name ?? "null"}");
                }
                catch (Exception ex) when (!(ex is ArgumentException))
                {
                    throw new ArgumentException($"WKT parse error: {ex.Message}", ex);
                }
            }
        }
    }
}