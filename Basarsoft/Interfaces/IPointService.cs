using Basarsoft.Dtos;

namespace Basarsoft.Interfaces
{
    public interface IPointService
    {
        Task<Response<PointReadDto>> AddPointAsync(PointCreateDto dto);
        Task<Response<PointReadDto>> AddManualPointAsync(ManualPointDto dto);
        Task<Response<List<PointReadDto>>> GetAllPointsAsync();
        Task<Response<PagedResponse<PointReadDto>>> GetPagedPointsAsync(PagedRequest request);
        Task<Response<PointReadDto>> GetByIdAsync(int id);
        Task<Response<PointReadDto>> UpdatePointAsync(int id, PointCreateDto dto);
        Task<Response<object>> DeletePointAsync(int id);
    }
}