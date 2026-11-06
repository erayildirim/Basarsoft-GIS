using NetTopologySuite.Geometries;
using System.ComponentModel.DataAnnotations.Schema;

namespace Basarsoft.Models
{
    public class Polygon
    {
        public int Id { get; set; }
        public string Name { get; set; }

        [Column(TypeName = "geometry")]
        public NetTopologySuite.Geometries.Polygon Location { get; set; }
    }
}
