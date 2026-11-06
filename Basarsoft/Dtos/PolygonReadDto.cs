using NetTopologySuite.IO;
using Basarsoft.Models;

namespace Basarsoft.Dtos
{
    public class PolygonReadDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Wkt { get; set; }

        public static PolygonReadDto FromEntity(Polygon e) => new PolygonReadDto
        {
            Id = e.Id,
            Name = e.Name,
            Wkt = new WKTWriter().Write(e.Location)
        };
    }
}
