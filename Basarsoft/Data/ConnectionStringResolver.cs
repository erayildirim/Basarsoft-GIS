using Npgsql;

namespace Basarsoft.Data
{
    /// <summary>
    /// Resolves the PostgreSQL connection string.
    /// Cloud providers (Render, Neon, Railway, Supabase...) usually expose a URL such as
    /// <c>postgresql://user:pass@host:5432/db?sslmode=require</c> in <c>DATABASE_URL</c>,
    /// which Npgsql does not accept directly, so it is converted here.
    /// </summary>
    public static class ConnectionStringResolver
    {
        public static string Resolve(IConfiguration configuration)
        {
            var databaseUrl = configuration["DATABASE_URL"];
            if (!string.IsNullOrWhiteSpace(databaseUrl))
                return FromUrl(databaseUrl);

            var connectionString = configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrWhiteSpace(connectionString))
                throw new InvalidOperationException(
                    "No database configured. Set ConnectionStrings__DefaultConnection or DATABASE_URL.");

            return connectionString.StartsWith("postgres", StringComparison.OrdinalIgnoreCase)
                ? FromUrl(connectionString)
                : connectionString;
        }

        private static string FromUrl(string url)
        {
            var uri = new Uri(url);
            var userInfo = uri.UserInfo.Split(':', 2);

            var builder = new NpgsqlConnectionStringBuilder
            {
                Host = uri.Host,
                Port = uri.Port > 0 ? uri.Port : 5432,
                Database = Uri.UnescapeDataString(uri.AbsolutePath.TrimStart('/')),
                Username = Uri.UnescapeDataString(userInfo[0]),
                Password = userInfo.Length > 1 ? Uri.UnescapeDataString(userInfo[1]) : null,
            };

            // Honour ?sslmode=... from the URL (Neon uses sslmode=require); otherwise use TLS when available.
            var query = System.Web.HttpUtility.ParseQueryString(uri.Query);
            var sslMode = query["sslmode"];
            builder.SslMode = !string.IsNullOrEmpty(sslMode) && Enum.TryParse<SslMode>(sslMode.Replace("-", ""), true, out var mode)
                ? mode
                : SslMode.Prefer;

            return builder.ConnectionString;
        }
    }
}
