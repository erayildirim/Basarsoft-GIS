
using Basarsoft.Models;
using Basarsoft.Repositories.Interfaces;

namespace Basarsoft.Repositories.Implementations
{
    public class LineRepository : GenericRepository<Line>, ILineRepository
    {
        public LineRepository(ApplicationDbContext context)
            : base(context)
        {
        }

        
    }
}
