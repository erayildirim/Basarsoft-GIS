using System.Globalization;
using System.Text.RegularExpressions;

namespace Basarsoft.Dtos
{
    public class SearchResultDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public string Wkt { get; set; } = string.Empty;
        public string DisplayText { get; set; } = string.Empty;
        public double? CenterX { get; set; } 
        public double? CenterY { get; set; }

        public static SearchResultDto FromPoint(PointReadDto point)
        {
            var match = Regex.Match(point.Wkt, @"POINT\s*\(\s*([-\d.Ee+]+)\s+([-\d.Ee+]+)\s*\)");
            double? x = null, y = null;
            if (match.Success)
            {
                x = double.Parse(match.Groups[1].Value, CultureInfo.InvariantCulture);
                y = double.Parse(match.Groups[2].Value, CultureInfo.InvariantCulture);
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