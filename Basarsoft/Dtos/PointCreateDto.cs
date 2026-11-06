using System.Text.Json.Serialization;
using NetTopologySuite.IO;
using NetTopologySuite.Geometries;
using NetTopologySuite;

namespace Basarsoft.Dtos
{
    public class PointCreateDto
    {
        public string Name { get; set; }
        public string Wkt { get; set; }

        [JsonIgnore]
        public Point Geometry
        {
            get
            {
                try
                {
                    if (string.IsNullOrWhiteSpace(Wkt))
                        throw new ArgumentException("WKT verisi boş olamaz");

                    var factory = NtsGeometryServices.Instance
                                      .CreateGeometryFactory(srid: 4326);
                    var reader = new WKTReader(factory);
                    var geom = reader.Read(Wkt.Trim());

                    if (geom is Point pt)
                    {
                        pt.SRID = 4326;
                        return pt;
                    }
                    throw new ArgumentException($"WKT geçerli bir Point değil. Geometri tipi: {geom?.GetType().Name ?? "null"}");
                }
                catch (Exception ex) when (!(ex is ArgumentException))
                {
                    throw new ArgumentException($"WKT parse hatası: {ex.Message}", ex);
                }
            }
        }
    }
}