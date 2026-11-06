using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using NetTopologySuite.IO;
using NetTopologySuite.Geometries;
using NetTopologySuite;

namespace Basarsoft.Dtos
{
    public class PointCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Wkt { get; set; } = string.Empty;

        // Computed from Wkt; excluded from JSON and from MVC model validation
        // (otherwise validation evaluates the getter and an invalid WKT becomes an unhandled 500).
        [JsonIgnore]
        [ValidateNever]
        public Point Geometry
        {
            get
            {
                try
                {
                    if (string.IsNullOrWhiteSpace(Wkt))
                        throw new ArgumentException("WKT cannot be empty.");

                    var reader = new WKTReader(NtsGeometryServices.Instance);
                    var geom = reader.Read(Wkt.Trim());

                    if (geom is Point pt)
                    {
                        pt.SRID = 4326;
                        return pt;
                    }
                    throw new ArgumentException($"WKT is not a valid Point. Geometry type: {geom?.GetType().Name ?? "null"}");
                }
                catch (Exception ex) when (!(ex is ArgumentException))
                {
                    throw new ArgumentException($"WKT parse error: {ex.Message}", ex);
                }
            }
        }
    }
}