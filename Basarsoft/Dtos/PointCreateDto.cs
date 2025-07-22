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
                var factory = NtsGeometryServices.Instance
                                  .CreateGeometryFactory(srid: 4326);
                var reader = new WKTReader(factory);
                var pt = reader.Read(Wkt) as Point;
                pt.SRID = 4326;
                return pt;
            }
        }
    }
}