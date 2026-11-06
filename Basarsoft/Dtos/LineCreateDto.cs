using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.ModelBinding.Validation;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;
using NetTopologySuite;

namespace Basarsoft.Dtos
{
    public class LineCreateDto
    {
        public string Name { get; set; } = string.Empty;
        public string Wkt { get; set; } = string.Empty;

        // Computed from Wkt; excluded from JSON and from MVC model validation
        // (otherwise validation evaluates the getter and an invalid WKT becomes an unhandled 500).
        [JsonIgnore]
        [ValidateNever]
        public LineString Geometry
        {
            get
            {
                try
                {
                    if (string.IsNullOrWhiteSpace(Wkt))
                        throw new ArgumentException("WKT cannot be empty.");

                    var reader = new WKTReader(NtsGeometryServices.Instance);
                    var geom = reader.Read(Wkt.Trim());

                    if (geom is LineString ls)
                    {
                        if (ls.NumPoints < 2)
                            throw new ArgumentException("A line must contain at least 2 points.");

                        ls.SRID = 4326;
                        return ls;
                    }
                    throw new ArgumentException($"WKT is not a valid LineString. Geometry type: {geom?.GetType().Name ?? "null"}");
                }
                catch (Exception ex) when (!(ex is ArgumentException))
                {
                    throw new ArgumentException($"WKT parse error: {ex.Message}", ex);
                }
            }
        }
    }
}