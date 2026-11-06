using System.Text.RegularExpressions;

namespace Basarsoft.Dtos
{
    public class SearchResultDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public string Wkt { get; set; }
        public string DisplayText { get; set; }
        public double? CenterX { get; set; } 
        public double? CenterY { get; set; }

        public static SearchResultDto FromPoint(PointReadDto point)
        {
            var match = Regex.Match(point.Wkt, @"POINT\s*\(\s*([-\d.]+)\s+([-\d.]+)\s*\)");
            double? x = null, y = null;
            if (match.Success)
            {
                x = double.Parse(match.Groups[1].Value);
                y = double.Parse(match.Groups[2].Value);
            }

            return new SearchResultDto
            {
                Id = point.Id,
                Name = point.Name,
                Type = "point",
                Wkt = point.Wkt,
                DisplayText = $"📍 {point.Name} (Point #{point.Id})",
                CenterX = x,
                CenterY = y
            };
        }

        public static SearchResultDto FromLine(LineReadDto line)
        {
            return new SearchResultDto
            {
                Id = line.Id,
                Name = line.Name,
                Type = "line",
                Wkt = line.Wkt,
                DisplayText = $"📏 {line.Name} (Line #{line.Id})",
                CenterX = null,
                CenterY = null
            };
        }

        public static SearchResultDto FromPolygon(PolygonReadDto polygon)
        {
            return new SearchResultDto
            {
                Id = polygon.Id,
                Name = polygon.Name,
                Type = "polygon",
                Wkt = polygon.Wkt,
                DisplayText = $"⬛ {polygon.Name} (Polygon #{polygon.Id})",
                CenterX = null, 
                CenterY = null
            };
        }
    }
}