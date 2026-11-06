using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Basarsoft.Dtos;
using Basarsoft.Helpers;
using Basarsoft.Interfaces;
using Basarsoft.Models;
using Microsoft.EntityFrameworkCore;

namespace Basarsoft.Services
{
    public class PolygonService : IPolygonService
    {
        private readonly IRepository<Polygon> _repo;
        private readonly ApplicationDbContext _context;

        public PolygonService(IRepository<Polygon> repo, ApplicationDbContext context)
        {
            _repo = repo;
            _context = context;
        }

        public async Task<Response<PolygonReadDto>> AddPolygonAsync(PolygonCreateDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Name))
                    return new Response<PolygonReadDto>("Name cannot be empty.");

                if (string.IsNullOrWhiteSpace(dto.Wkt))
                    return new Response<PolygonReadDto>("WKT cannot be empty.");

                var e = new Polygon
                {
                    Name = dto.Name.Trim(),
                    Location = dto.Geometry
                };

                var error = GeometryValidator.Validate(e.Location);
                if (error != null)
                    return new Response<PolygonReadDto>(error);

                await _repo.AddAsync(e);
                await _repo.SaveChangesAsync();
                return new Response<PolygonReadDto>(PolygonReadDto.FromEntity(e));
            }
            catch (System.ArgumentException ex)
            {
                return new Response<PolygonReadDto>(ex.Message);
            }
            catch (System.Exception ex)
            {
                return new Response<PolygonReadDto>($"Server error: {ex.Message}");
            }
        }

        public async Task<Response<PolygonReadDto>> AddManualPolygonAsync(ManualPolygonDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Name))
                    return new Response<PolygonReadDto>("Name cannot be empty.");

                var wkt = dto.ToWkt();
                var createDto = new PolygonCreateDto { Name = dto.Name, Wkt = wkt };

                return await AddPolygonAsync(createDto);
            }
            catch (System.Exception ex)
            {
                return new Response<PolygonReadDto>($"Manual polygon entry error: {ex.Message}");
            }
        }

        public async Task<Response<List<PolygonReadDto>>> GetAllPolygonsAsync()
        {
            try
            {
                var all = await _repo.GetAllAsync();
                var list = all
                    .Where(p => p != null && p.Location != null)
                    .Select(PolygonReadDto.FromEntity)
                    .ToList();
                return new Response<List<PolygonReadDto>>(list);
            }
            catch (System.Exception ex)
            {
                return new Response<List<PolygonReadDto>>($"Data fetch error: {ex.Message}");
            }
        }

        public async Task<Response<PagedResponse<PolygonReadDto>>> GetPagedPolygonsAsync(PagedRequest request)
        {
            try
            {
                var query = _context.Polygons.AsQueryable();

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
                    .Select(PolygonReadDto.FromEntity)
                    .ToList();

                var pagedResponse = new PagedResponse<PolygonReadDto>(
                    dtos, request.Page, request.PageSize, totalCount, request.SearchTerm, request.GeometryType);

                return new Response<PagedResponse<PolygonReadDto>>(pagedResponse);
            }
            catch (System.Exception ex)
            {
                return new Response<PagedResponse<PolygonReadDto>>($"Paged data error: {ex.Message}");
            }
        }

        public async Task<Response<PolygonReadDto>> GetPolygonByIdAsync(int id)
        {
            try
            {
                var e = await _repo.GetByIdAsync(id);
                if (e == null) return new Response<PolygonReadDto>($"Record with ID {id} was not found.");
                return new Response<PolygonReadDto>(PolygonReadDto.FromEntity(e));
            }
            catch (System.Exception ex)
            {
                return new Response<PolygonReadDto>($"Data fetch error: {ex.Message}");
            }
        }

        public async Task<Response<PolygonReadDto>> UpdatePolygonAsync(int id, PolygonCreateDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Name))
                    return new Response<PolygonReadDto>("Name cannot be empty.");

                if (string.IsNullOrWhiteSpace(dto.Wkt))
                    return new Response<PolygonReadDto>("WKT cannot be empty.");

                var e = await _repo.GetByIdAsync(id);
                if (e == null) return new Response<PolygonReadDto>($"Record with ID {id} was not found.");

                e.Name = dto.Name.Trim();
                e.Location = dto.Geometry;

                var error = GeometryValidator.Validate(e.Location);
                if (error != null)
                    return new Response<PolygonReadDto>(error);

                _repo.Update(e);
                await _repo.SaveChangesAsync();
                return new Response<PolygonReadDto>(PolygonReadDto.FromEntity(e));
            }
            catch (System.ArgumentException ex)
            {
                return new Response<PolygonReadDto>(ex.Message);
            }
            catch (System.Exception ex)
            {
                return new Response<PolygonReadDto>($"Update error: {ex.Message}");
            }
        }

        public async Task<Response<object>> DeletePolygonAsync(int id)
        {
            try
            {
                var e = await _repo.GetByIdAsync(id);
                if (e == null)
                    return new Response<object>($"Record with ID {id} was not found.");

                _repo.Delete(e);
                await _repo.SaveChangesAsync();

                return new Response<object>(new
                {
                    id = id,
                    message = "Polygon deleted successfully",
                    type = "polygon"
                });
            }
            catch (System.Exception ex)
            {
                return new Response<object>($"Delete error: {ex.Message}");
            }
        }
    }
}
