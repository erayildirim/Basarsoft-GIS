using Basarsoft.Models;
using Microsoft.EntityFrameworkCore;

namespace Basarsoft
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Basarsoft.Models.Point> Points { get; set; }
        public DbSet<Basarsoft.Models.Line> Lines { get; set; }
        public DbSet<Basarsoft.Models.Polygon> Polygons { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Line>()
                .Property(l => l.Location)
                .HasColumnType("geometry");

            modelBuilder.Entity<Polygon>()
                .Property(p => p.Location)
                .HasColumnType("geometry");

            base.OnModelCreating(modelBuilder);
        }
    }

    
}