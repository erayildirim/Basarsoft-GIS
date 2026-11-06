using System.Text.Json.Serialization;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;
using NetTopologySuite;

namespace Basarsoft.Dtos
{
    public class PolygonCreateDto
    {
        public string Name { get; set; }
        public string Wkt { get; set; }

        [JsonIgnore]
        public NetTopologySuite.Geometries.Polygon Geometry
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

                    if (geom is NetTopologySuite.Geometries.Polygon pg)
                    {
                        if (!pg.IsValid)
                            throw new ArgumentException("Polygon geometrisi geçersiz");

                        if (pg.ExteriorRing?.NumPoints < 4)
                            throw new ArgumentException("Polygon en az 4 nokta içermelidir (ilk ve son nokta aynı olmalı)");

                        pg.SRID = 4326;
                        return pg;
                    }
                    throw new ArgumentException($"WKT geçerli bir Polygon değil. Geometri tipi: {geom?.GetType().Name ?? "null"}");
                }
                catch (Exception ex) when (!(ex is ArgumentException))
                {
                    throw new ArgumentException($"WKT parse hatası: {ex.Message}", ex);
                }
            }
        }
    }
}