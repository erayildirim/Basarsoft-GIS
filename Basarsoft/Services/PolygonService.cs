using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Basarsoft.Dtos;
using Basarsoft.Interfaces;
using Basarsoft.Models;
using Microsoft.AspNetCore.Mvc;
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
                    return new Response<PolygonReadDto>("İsim alanı boş olamaz.");

                if (string.IsNullOrWhiteSpace(dto.Wkt))
                    return new Response<PolygonReadDto>("WKT verisi boş olamaz.");

                var e = new Polygon
                {
                    Name = dto.Name.Trim(),
                    Location = dto.Geometry
                };

                await _repo.AddAsync(e);
                await _repo.SaveChangesAsync();
                return new Response<PolygonReadDto>(PolygonReadDto.FromEntity(e));
            }
            catch (System.ArgumentException ex)
            {
                return new Response<PolygonReadDto>($"WKT format hatası: {ex.Message}");
            }
            catch (System.Exception ex)
            {
                return new Response<PolygonReadDto>($"Sunucu hatası: {ex.Message}");
            }
        }

        public async Task<Response<PolygonReadDto>> AddManualPolygonAsync(ManualPolygonDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Name))
                    return new Response<PolygonReadDto>("İsim alanı boş olamaz.");

                var wkt = dto.ToWkt();
                var createDto = new PolygonCreateDto { Name = dto.Name, Wkt = wkt };

                return await AddPolygonAsync(createDto);
            }
            catch (System.Exception ex)
            {
                return new Response<PolygonReadDto>($"Manuel polygon ekleme hatası: {ex.Message}");
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
                return new Response<List<PolygonReadDto>>($"Veri getirme hatası: {ex.Message}");
            }
        }

        public async Task<Response<PagedResponse<PolygonReadDto>>> GetPagedPolygonsAsync(PagedRequest request)
        {
            try
            {
                var query = _context.Polygons.AsQueryable();

                if (!string.IsNullOrWhiteSpace(request.SearchTerm))
                {
                    query = query.Where(p => p.Name.Contains(request.SearchTerm));
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
                return new Response<PagedResponse<PolygonReadDto>>($"Sayfalı veri getirme hatası: {ex.Message}");
            }
        }

        public async Task<Response<PolygonReadDto>> GetPolygonByIdAsync(int id)
        {
            try
            {
                var e = await _repo.GetByIdAsync(id);
                if (e == null) return new Response<PolygonReadDto>($"ID {id} bulunamadı.");
                return new Response<PolygonReadDto>(PolygonReadDto.FromEntity(e));
            }
            catch (System.Exception ex)
            {
                return new Response<PolygonReadDto>($"Veri getirme hatası: {ex.Message}");
            }
        }

        public async Task<Response<PolygonReadDto>> UpdatePolygonAsync(int id, PolygonCreateDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Name))
                    return new Response<PolygonReadDto>("İsim alanı boş olamaz.");

                if (string.IsNullOrWhiteSpace(dto.Wkt))
                    return new Response<PolygonReadDto>("WKT verisi boş olamaz.");

                var e = await _repo.GetByIdAsync(id);
                if (e == null) return new Response<PolygonReadDto>($"ID {id} bulunamadı.");

                e.Name = dto.Name.Trim();
                e.Location = dto.Geometry;

                _repo.Update(e);
                await _repo.SaveChangesAsync();
                return new Response<PolygonReadDto>(PolygonReadDto.FromEntity(e));
            }
            catch (System.ArgumentException ex)
            {
                return new Response<PolygonReadDto>($"WKT format hatası: {ex.Message}");
            }
            catch (System.Exception ex)
            {
                return new Response<PolygonReadDto>($"Güncelleme hatası: {ex.Message}");
            }
        }

        public async Task<Response<object>> DeletePolygonAsync(int id)
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
                    message = "Polygon başarıyla silindi",
                    type = "polygon"
                });
            }
            catch (System.Exception ex)
            {
                return new Response<object>($"Silme hatası: {ex.Message}");
            }
        }
    }
}
