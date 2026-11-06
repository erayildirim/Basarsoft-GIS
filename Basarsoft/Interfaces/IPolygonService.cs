using Basarsoft.Dtos;

namespace Basarsoft.Interfaces
{
    public interface IPolygonService
    {
        Task<Response<PolygonReadDto>> AddPolygonAsync(PolygonCreateDto dto);
        Task<Response<PolygonReadDto>> AddManualPolygonAsync(ManualPolygonDto dto);
        Task<Response<List<PolygonReadDto>>> GetAllPolygonsAsync();
        Task<Response<PagedResponse<PolygonReadDto>>> GetPagedPolygonsAsync(PagedRequest request);
        Task<Response<PolygonReadDto>> GetPolygonByIdAsync(int id);
        Task<Response<PolygonReadDto>> UpdatePolygonAsync(int id, PolygonCreateDto dto);
        Task<Response<object>> DeletePolygonAsync(int id);
    }
}