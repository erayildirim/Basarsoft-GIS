using Basarsoft.Interfaces;
using Basarsoft.Models;

namespace Basarsoft.Repositories.Implementations
{
    public class PointRepository
        : GenericRepository<Point>, IPointRepository
    {
        public PointRepository(ApplicationDbContext context)
            : base(context)
        {
        }

    }
}
