using NetTopologySuite.Geometries;

namespace Basarsoft.Helpers
{
    /// <summary>
    /// Shared validation for WGS84 (EPSG:4326) geometries.
    /// </summary>
    public static class GeometryValidator
    {
        private const double MinLon = -180.0, MaxLon = 180.0;
        private const double MinLat = -90.0, MaxLat = 90.0;

        /// <summary>
        /// Returns an error message if any coordinate is missing, NaN or outside the
        /// longitude/latitude range, otherwise <c>null</c>.
        /// </summary>
        public static string? Validate(Geometry? geometry)
        {
            if (geometry == null || geometry.IsEmpty)
                return "Location is missing.";

            foreach (var c in geometry.Coordinates)
            {
                if (double.IsNaN(c.X) || double.IsNaN(c.Y))
                    return "Invalid coordinate values.";

                if (c.X < MinLon || c.X > MaxLon)
                    return $"Longitude must be between {MinLon} and {MaxLon}.";

                if (c.Y < MinLat || c.Y > MaxLat)
                    return $"Latitude must be between {MinLat} and {MaxLat}.";
            }

            return null;
        }
    }

    public static class SearchHelper
    {
        /// <summary>Escape character used in <see cref="ContainsPattern"/>; pass it to EF.Functions.ILike.</summary>
        public const string EscapeCharacter = "\\";

        /// <summary>
        /// Builds a "contains" pattern for PostgreSQL ILIKE, escaping LIKE wildcards
        /// so user input such as "%" or "_" is matched literally.
        /// </summary>
        public static string ContainsPattern(string term)
        {
            var escaped = term.Trim()
                .Replace("\\", "\\\\")
                .Replace("%", "\\%")
                .Replace("_", "\\_");
            return $"%{escaped}%";
        }
    }
}
