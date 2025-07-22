using Basarsoft.Dtos;
using System.Collections.Generic;

namespace Basarsoft.Interfaces
{
    public interface IPointService
    {
        Task<Response<PointReadDto>> AddPointAsync(PointCreateDto dto);
        Task<Response<List<PointReadDto>>> GetAllPointsAsync();
        Task<Response<PointReadDto>> GetByIdAsync(int id);
        Task<Response<PointReadDto>> UpdatePointAsync(int id, PointCreateDto dto);
        Task<Response<object>> DeletePointAsync(int id);

    }
}