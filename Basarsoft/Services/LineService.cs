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
    public class LineService : ILineService
    {
        private readonly IRepository<Line> _repo;
        private readonly ApplicationDbContext _context;

        public LineService(IRepository<Line> repo, ApplicationDbContext context)
        {
            _repo = repo;
            _context = context;
        }

        public async Task<Response<LineReadDto>> AddLineAsync(LineCreateDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Name))
                    return new Response<LineReadDto>("Name cannot be empty.");

                if (string.IsNullOrWhiteSpace(dto.Wkt))
                    return new Response<LineReadDto>("WKT cannot be empty.");

                var e = new Line
                {
                    Name = dto.Name.Trim(),
                    Location = dto.Geometry
                };

                var error = GeometryValidator.Validate(e.Location);
                if (error != null)
                    return new Response<LineReadDto>(error);

                await _repo.AddAsync(e);
                await _repo.SaveChangesAsync();
                return new Response<LineReadDto>(LineReadDto.FromEntity(e));
            }
            catch (System.ArgumentException ex)
            {
                return new Response<LineReadDto>(ex.Message);
            }
            catch (System.Exception ex)
            {
                return new Response<LineReadDto>($"Server error: {ex.Message}");
            }
        }

        public async Task<Response<LineReadDto>> AddManualLineAsync(ManualLineDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Name))
                    return new Response<LineReadDto>("Name cannot be empty.");

                var wkt = dto.ToWkt();
                var createDto = new LineCreateDto { Name = dto.Name, Wkt = wkt };

                return await AddLineAsync(createDto);
            }
            catch (System.Exception ex)
            {
                return new Response<LineReadDto>($"Manual line entry error: {ex.Message}");
            }
        }

        public async Task<Response<List<LineReadDto>>> GetAllLinesAsync()
        {
            try
            {
                var all = await _repo.GetAllAsync();
                var list = all
                    .Where(l => l != null && l.Location != null)
                    .Select(LineReadDto.FromEntity)
                    .ToList();
                return new Response<List<LineReadDto>>(list);
            }
            catch (System.Exception ex)
            {
                return new Response<List<LineReadDto>>($"Data fetch error: {ex.Message}");
            }
        }

        public async Task<Response<PagedResponse<LineReadDto>>> GetPagedLinesAsync(PagedRequest request)
        {
            try
            {
                var query = _context.Lines.AsQueryable();

                if (!string.IsNullOrWhiteSpace(request.SearchTerm))
                {
                    var pattern = SearchHelper.ContainsPattern(request.SearchTerm);
                    query = query.Where(l => EF.Functions.ILike(l.Name, pattern, SearchHelper.EscapeCharacter));
                }

                var totalCount = await query.CountAsync();

                var items = await query
                    .OrderBy(l => l.Id)
                    .Skip((request.Page - 1) * request.PageSize)
                    .Take(request.PageSize)
                    .ToListAsync();

                var dtos = items
                    .Where(l => l != null && l.Location != null)
                    .Select(LineReadDto.FromEntity)
                    .ToList();

                var pagedResponse = new PagedResponse<LineReadDto>(
                    dtos, request.Page, request.PageSize, totalCount, request.SearchTerm, request.GeometryType);

                return new Response<PagedResponse<LineReadDto>>(pagedResponse);
            }
            catch (System.Exception ex)
            {
                return new Response<PagedResponse<LineReadDto>>($"Paged data error: {ex.Message}");
            }
        }

        public async Task<Response<LineReadDto>> GetLineByIdAsync(int id)
        {
            try
            {
                var e = await _repo.GetByIdAsync(id);
                if (e == null) return new Response<LineReadDto>($"Record with ID {id} was not found.");
                return new Response<LineReadDto>(LineReadDto.FromEntity(e));
            }
            catch (System.Exception ex)
            {
                return new Response<LineReadDto>($"Data fetch error: {ex.Message}");
            }
        }

        public async Task<Response<LineReadDto>> UpdateLineAsync(int id, LineCreateDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Name))
                    return new Response<LineReadDto>("Name cannot be empty.");

                if (string.IsNullOrWhiteSpace(dto.Wkt))
                    return new Response<LineReadDto>("WKT cannot be empty.");

                var e = await _repo.GetByIdAsync(id);
                if (e == null) return new Response<LineReadDto>($"Record with ID {id} was not found.");

                e.Name = dto.Name.Trim();
                e.Location = dto.Geometry;

                var error = GeometryValidator.Validate(e.Location);
                if (error != null)
                    return new Response<LineReadDto>(error);

                _repo.Update(e);
                await _repo.SaveChangesAsync();
                return new Response<LineReadDto>(LineReadDto.FromEntity(e));
            }
            catch (System.ArgumentException ex)
            {
                return new Response<LineReadDto>(ex.Message);
            }
            catch (System.Exception ex)
            {
                return new Response<LineReadDto>($"Update error: {ex.Message}");
            }
        }

        public async Task<Response<object>> DeleteLineAsync(int id)
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
                    message = "Line deleted successfully",
                    type = "line"
                });
            }
            catch (System.Exception ex)
            {
                return new Response<object>($"Delete error: {ex.Message}");
            }
        }
    }
}