using System.Threading.Tasks;
using Basarsoft.Interfaces;
using Basarsoft.Repositories.Interfaces;

namespace Basarsoft.Repositories.Implementations
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;

        public IPointRepository Points { get; }
        public ILineRepository Lines { get; }
        public IPolygonRepository Polygons { get; }

        public UnitOfWork(
            ApplicationDbContext context,
            IPointRepository pointRepo,
            ILineRepository lineRepo,
            IPolygonRepository polygonRepo)
        {
            _context = context;
            Points = pointRepo;
            Lines = lineRepo;
            Polygons = polygonRepo;
        }

        public async Task<int> CommitAsync() =>
            await _context.SaveChangesAsync();

        public void Dispose() =>
            _context.Dispose();
    }
}
