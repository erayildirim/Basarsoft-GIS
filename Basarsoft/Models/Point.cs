using NetTopologySuite.Geometries;
using System.ComponentModel.DataAnnotations.Schema;

namespace Basarsoft.Models
{
    public class Point
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;

        [Column(TypeName = "geometry")]
        public NetTopologySuite.Geometries.Point Location { get; set; } = null!;
    }
}