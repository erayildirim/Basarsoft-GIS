using NetTopologySuite.IO;
using Basarsoft.Models;

namespace Basarsoft.Dtos
{
    public class PointReadDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Wkt { get; set; }

        public static PointReadDto FromEntity(Models.Point p)
        {
            return new PointReadDto
            {
                Id = p.Id,
                Name = p.Name,
                Wkt = new WKTWriter().Write(p.Location)
            };
        }
    }
}