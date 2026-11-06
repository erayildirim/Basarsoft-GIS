using NetTopologySuite.IO;
using Basarsoft.Models;

namespace Basarsoft.Dtos
{
    public class LineReadDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Wkt { get; set; }

        public static LineReadDto FromEntity(Line e) => new LineReadDto
        {
            Id = e.Id,
            Name = e.Name,
            Wkt = new WKTWriter().Write(e.Location)
        };
    }
}
