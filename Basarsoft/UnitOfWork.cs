using Basarsoft.Interfaces;
using Basarsoft.Models;
using Basarsoft.Repositories.Interfaces;
using System.Threading.Tasks;

namespace Basarsoft.Repositories.Implementations
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        public IPointRepository Points { get; }

        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context;
            Points = new PointRepository(_context);
        }

        public async Task<int> CommitAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
