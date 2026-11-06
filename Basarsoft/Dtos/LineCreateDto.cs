using System.Text.Json.Serialization;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;
using NetTopologySuite;

namespace Basarsoft.Dtos
{
    public class LineCreateDto
    {
        public string Name { get; set; }
        public string Wkt { get; set; }

        [JsonIgnore]
        public LineString Geometry
        {
            get
            {
                try
                {
                    if (string.IsNullOrWhiteSpace(Wkt))
                        throw new ArgumentException("WKT verisi boş olamaz");

                    var factory = NtsGeometryServices.Instance.CreateGeometryFactory(srid: 4326);
                    var reader = new WKTReader(factory);
                    var geom = reader.Read(Wkt.Trim());

                    if (geom is LineString ls)
                    {
                        if (ls.NumPoints < 2)
                            throw new ArgumentException("LineString en az 2 nokta içermelidir");

                        ls.SRID = 4326;
                        return ls;
                    }
                    throw new ArgumentException($"WKT geçerli bir LineString değil. Geometri tipi: {geom?.GetType().Name ?? "null"}");
                }
                catch (Exception ex) when (!(ex is ArgumentException))
                {
                    throw new ArgumentException($"WKT parse hatası: {ex.Message}", ex);
                }
            }
        }
    }
}