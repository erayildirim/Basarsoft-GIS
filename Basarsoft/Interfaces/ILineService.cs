using Basarsoft.Dtos;

namespace Basarsoft.Interfaces
{
    public interface ILineService
    {
        Task<Response<LineReadDto>> AddLineAsync(LineCreateDto dto);
        Task<Response<LineReadDto>> AddManualLineAsync(ManualLineDto dto);
        Task<Response<List<LineReadDto>>> GetAllLinesAsync();
        Task<Response<PagedResponse<LineReadDto>>> GetPagedLinesAsync(PagedRequest request);
        Task<Response<LineReadDto>> GetLineByIdAsync(int id);
        Task<Response<LineReadDto>> UpdateLineAsync(int id, LineCreateDto dto);
        Task<Response<object>> DeleteLineAsync(int id);
    }
}