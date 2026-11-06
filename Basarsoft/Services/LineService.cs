using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Basarsoft.Dtos;
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
                    return new Response<LineReadDto>("İsim alanı boş olamaz.");

                if (string.IsNullOrWhiteSpace(dto.Wkt))
                    return new Response<LineReadDto>("WKT verisi boş olamaz.");

                var e = new Line
                {
                    Name = dto.Name.Trim(),
                    Location = dto.Geometry
                };

                await _repo.AddAsync(e);
                await _repo.SaveChangesAsync();
                return new Response<LineReadDto>(LineReadDto.FromEntity(e));
            }
            catch (System.ArgumentException ex)
            {
                return new Response<LineReadDto>($"WKT format hatası: {ex.Message}");
            }
            catch (System.Exception ex)
            {
                return new Response<LineReadDto>($"Sunucu hatası: {ex.Message}");
            }
        }

        public async Task<Response<LineReadDto>> AddManualLineAsync(ManualLineDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Name))
                    return new Response<LineReadDto>("İsim alanı boş olamaz.");

                var wkt = dto.ToWkt();
                var createDto = new LineCreateDto { Name = dto.Name, Wkt = wkt };

                return await AddLineAsync(createDto);
            }
            catch (System.Exception ex)
            {
                return new Response<LineReadDto>($"Manuel line ekleme hatası: {ex.Message}");
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
                return new Response<List<LineReadDto>>($"Veri getirme hatası: {ex.Message}");
            }
        }

        public async Task<Response<PagedResponse<LineReadDto>>> GetPagedLinesAsync(PagedRequest request)
        {
            try
            {
                var query = _context.Lines.AsQueryable();

                if (!string.IsNullOrWhiteSpace(request.SearchTerm))
                {
                    query = query.Where(l => l.Name.Contains(request.SearchTerm));
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
                return new Response<PagedResponse<LineReadDto>>($"Sayfalı veri getirme hatası: {ex.Message}");
            }
        }

        public async Task<Response<LineReadDto>> GetLineByIdAsync(int id)
        {
            try
            {
                var e = await _repo.GetByIdAsync(id);
                if (e == null) return new Response<LineReadDto>($"ID {id} bulunamadı.");
                return new Response<LineReadDto>(LineReadDto.FromEntity(e));
            }
            catch (System.Exception ex)
            {
                return new Response<LineReadDto>($"Veri getirme hatası: {ex.Message}");
            }
        }

        public async Task<Response<LineReadDto>> UpdateLineAsync(int id, LineCreateDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Name))
                    return new Response<LineReadDto>("İsim alanı boş olamaz.");

                if (string.IsNullOrWhiteSpace(dto.Wkt))
                    return new Response<LineReadDto>("WKT verisi boş olamaz.");

                var e = await _repo.GetByIdAsync(id);
                if (e == null) return new Response<LineReadDto>($"ID {id} bulunamadı.");

                e.Name = dto.Name.Trim();
                e.Location = dto.Geometry;

                _repo.Update(e);
                await _repo.SaveChangesAsync();
                return new Response<LineReadDto>(LineReadDto.FromEntity(e));
            }
            catch (System.ArgumentException ex)
            {
                return new Response<LineReadDto>($"WKT format hatası: {ex.Message}");
            }
            catch (System.Exception ex)
            {
                return new Response<LineReadDto>($"Güncelleme hatası: {ex.Message}");
            }
        }

        public async Task<Response<object>> DeleteLineAsync(int id)
        {
            try
            {
                var e = await _repo.GetByIdAsync(id);
                if (e == null)
                    return new Response<object>($"ID {id} bulunamadı.");

                _repo.Delete(e);
                await _repo.SaveChangesAsync();

                return new Response<object>(new
                {
                    id = id,
                    message = "Line başarıyla silindi",
                    type = "line"
                });
            }
            catch (System.Exception ex)
            {
                return new Response<object>($"Silme hatası: {ex.Message}");
            }
        }
    }
}