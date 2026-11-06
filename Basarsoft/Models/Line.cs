using NetTopologySuite.Geometries;
using System.ComponentModel.DataAnnotations.Schema;

namespace Basarsoft.Models
{
    public class Line
    {
        public int Id { get; set; }
        public string Name { get; set; }

        [Column(TypeName = "geometry")]
        public LineString Location { get; set; }
    }
}
