using Basarsoft.Dtos;

namespace Basarsoft.Interfaces
{
    public interface ISearchService
    {
        Task<Response<List<SearchResultDto>>> SearchAsync(string searchTerm, string? geometryType = null, int maxResults = 20);
    }
}