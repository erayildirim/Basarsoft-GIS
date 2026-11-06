namespace Basarsoft.Dtos
{
    public class ManualPointDto
    {
        public string Name { get; set; }
        public double Latitude { get; set; }
        public double Longitude { get; set; }

        public string ToWkt() => $"POINT({Longitude} {Latitude})";
    }

    public class ManualLineDto
    {
        public string Name { get; set; }
        public double StartLatitude { get; set; }
        public double StartLongitude { get; set; }
        public double EndLatitude { get; set; }
        public double EndLongitude { get; set; }

        public string ToWkt() => $"LINESTRING({StartLongitude} {StartLatitude}, {EndLongitude} {EndLatitude})";
    }

    public class ManualPolygonDto
    {
        public string Name { get; set; }
        public List<CoordinateDto> Coordinates { get; set; } = new List<CoordinateDto>();

        public string ToWkt()
        {
            if (Coordinates.Count < 3)
                throw new ArgumentException("Polygon must have at least 3 coordinates");

            var coords = Coordinates.ToList();
            if (coords.First().Latitude != coords.Last().Latitude ||
                coords.First().Longitude != coords.Last().Longitude)
            {
                coords.Add(coords.First());
            }

            var coordStrings = coords.Select(c => $"{c.Longitude} {c.Latitude}");
            return $"POLYGON(({string.Join(", ", coordStrings)}))";
        }
    }

    public class CoordinateDto
    {
        public double Latitude { get; set; }
        public double Longitude { get; set; }
    }
}