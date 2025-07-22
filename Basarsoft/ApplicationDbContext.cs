using Microsoft.EntityFrameworkCore;

namespace Basarsoft
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        // Explicitly reference the entity in Basarsoft.Models to avoid naming conflicts
        public DbSet<Basarsoft.Models.Point> Points { get; set; }
    }
}