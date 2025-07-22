using Basarsoft.Interfaces;
using System;
using System.Threading.Tasks;

namespace Basarsoft.Repositories.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IPointRepository Points { get; }
        Task<int> CommitAsync();
    }
}
