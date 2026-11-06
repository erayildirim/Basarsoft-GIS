using Basarsoft.Interfaces;
using System;
using System.Threading.Tasks;

namespace Basarsoft.Repositories.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IPointRepository Points { get; }
        ILineRepository Lines { get; }
        IPolygonRepository Polygons { get; }
        Task<int> CommitAsync();
    }
}
