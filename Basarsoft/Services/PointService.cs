using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Basarsoft.Dtos;
using Basarsoft.Helpers;
using Basarsoft.Interfaces;
using Microsoft.EntityFrameworkCore;
using ModelPoint = Basarsoft.Models.Point;

namespace Basarsoft.Services
{
    public class PointService : IPointService
    {
        private readonly IRepository<ModelPoint> _repo;
        private readonly ApplicationDbContext _context;

        public PointService(IRepository<ModelPoint> repo, ApplicationDbContext context)
        {
            _repo = repo;
            _context = context;
        }

        public async Task<Response<PointReadDto>> AddPointAsync(PointCreateDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Name))
                    return new Response<PointReadDto>("Name cannot be empty.");

                if (string.IsNullOrWhiteSpace(dto.Wkt))
                    return new Response<PointReadDto>("WKT cannot be empty.");

                var entity = new ModelPoint
                {
                    Name = dto.Name.Trim(),
                    Location = dto.Geometry
                };

                var error = GeometryValidator.Validate(entity.Location);
                if (error != null)
                    return new Response<PointReadDto>(error);

                await _repo.AddAsync(entity);
                await _repo.SaveChangesAsync();

                return new Response<PointReadDto>(PointReadDto.FromEntity(entity));
            }
            catch (System.ArgumentException ex)
            {
                return new Response<PointReadDto>(ex.Message);
            }
            catch (System.Exception ex)
            {
                return new Response<PointReadDto>($"Server error: {ex.Message}");
            }
        }

        public async Task<Response<PointReadDto>> AddManualPointAsync(ManualPointDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Name))
                    return new Response<PointReadDto>("Name cannot be empty.");

                var wkt = dto.ToWkt();
                var createDto = new PointCreateDto { Name = dto.Name, Wkt = wkt };

                return await AddPointAsync(createDto);
            }
            catch (System.Exception ex)
            {
                return new Response<PointReadDto>($"Manual point entry error: {ex.Message}");
            }
        }

        public async Task<Response<List<PointReadDto>>> GetAllPointsAsync()
        {
            try
            {
                var all = await _repo.GetAllAsync();
                var list = all
                    .Where(p => p != null && p.Location != null)
                    .Select(p => PointReadDto.FromEntity(p))
                    .ToList();
                return new Response<List<PointReadDto>>(list);
            }
            catch (System.Exception ex)
            {
                return new Response<List<PointReadDto>>($"Data fetch error: {ex.Message}");
            }
        }

        public async Task<Response<PagedResponse<PointReadDto>>> GetPagedPointsAsync(PagedRequest request)
        {
            try
            {
                var query = _context.Points.AsQueryable();

                // Search filter
                if (!string.IsNullOrWhiteSpace(request.SearchTerm))
                {
                    var pattern = SearchHelper.ContainsPattern(request.SearchTerm);
                    query = query.Where(p => EF.Functions.ILike(p.Name, pattern, SearchHelper.EscapeCharacter));
                }

                var totalCount = await query.CountAsync();

                var items = await query
                    .OrderBy(p => p.Id)
                    .Skip((request.Page - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .ToListAsync();

                var dtos = items
                    .Where(p => p != null && p.Location != null)
                    .Select(PointReadDto.FromEntity)
                    .ToList();

                var pagedResponse = new PagedResponse<PointReadDto>(
                    dtos, request.Page, request.PageSize, totalCount, request.SearchTerm, request.GeometryType);

                return new Response<PagedResponse<PointReadDto>>(pagedResponse);
            }
            catch (System.Exception ex)
            {
                return new Response<PagedResponse<PointReadDto>>($"Paged data error: {ex.Message}");
            }
        }

        public async Task<Response<PointReadDto>> GetByIdAsync(int id)
        {
            try
            {
                var p = await _repo.GetByIdAsync(id);
                if (p == null)
                    return new Response<PointReadDto>($"Record with ID {id} was not found.");

                return new Response<PointReadDto>(PointReadDto.FromEntity(p));
            }
            catch (System.Exception ex)
            {
                return new Response<PointReadDto>($"Data fetch error: {ex.Message}");
            }
        }

        public async Task<Response<PointReadDto>> UpdatePointAsync(int id, PointCreateDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Name))
                    return new Response<PointReadDto>("Name cannot be empty.");

                if (string.IsNullOrWhiteSpace(dto.Wkt))
                    return new Response<PointReadDto>("WKT cannot be empty.");

                var existing = await _repo.GetByIdAsync(id);
                if (existing == null)
                    return new Response<PointReadDto>($"Record with ID {id} was not found.");

                existing.Name = dto.Name.Trim();
                existing.Location = dto.Geometry;

                var error = GeometryValidator.Validate(existing.Location);
                if (error != null)
                    return new Response<PointReadDto>(error);

                _repo.Update(existing);
                await _repo.SaveChangesAsync();

                return new Response<PointReadDto>(PointReadDto.FromEntity(existing));
            }
            catch (System.ArgumentException ex)
            {
                return new Response<PointReadDto>(ex.Message);
            }
            catch (System.Exception ex)
            {
                return new Response<PointReadDto>($"Update error: {ex.Message}");
            }
        }

        public async Task<Response<object>> DeletePointAsync(int id)
        {
            try
            {
                var p = await _repo.GetByIdAsync(id);
                if (p == null)
                    return new Response<object>($"Record with ID {id} was not found.");

                _repo.Delete(p);
                await _repo.SaveChangesAsync();

                return new Response<object>(new
                {
                    id = id,
                    message = "Point deleted successfully",
                    type = "point"
                });
            }
            catch (System.Exception ex)
            {
                return new Response<object>($"Delete error: {ex.Message}");
            }
        }
    }
}