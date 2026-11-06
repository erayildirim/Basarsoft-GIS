
using Basarsoft.Models;
using Basarsoft.Repositories.Interfaces;

namespace Basarsoft.Repositories.Implementations
{
    public class PolygonRepository : GenericRepository<Polygon>, IPolygonRepository
    {
        public PolygonRepository(ApplicationDbContext context)
            : base(context)
        {
        }

        
    }
}
