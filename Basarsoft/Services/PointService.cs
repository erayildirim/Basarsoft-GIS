using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Basarsoft.Dtos;
using Basarsoft.Interfaces;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;
using NetTopologySuite.IO;
using NetTopologySuite;
using ModelPoint = Basarsoft.Models.Point;

namespace Basarsoft.Services
{
    public class PointService : IPointService
    {
        private readonly IRepository<ModelPoint> _repo;
        private readonly ApplicationDbContext _context;

        private const double MIN_LON = -180.0, MAX_LON = 180.0;
        private const double MIN_LAT = -90.0, MAX_LAT = 90.0;

        public PointService(IRepository<ModelPoint> repo, ApplicationDbContext context)
        {
            _repo = repo;
            _context = context;
        }

        private string Validate(ModelPoint p)
        {
            try
            {
                if (p.Location == null)
                    return "Konum bilgisi eksik.";

                double x = p.Location.X;
                double y = p.Location.Y;

                if (double.IsNaN(x) || double.IsNaN(y))
                    return "Geçersiz koordinat değerleri.";

                if (x < MIN_LON || x > MAX_LON)
                    return $"Boylam {MIN_LON}–{MAX_LON} aralığında olmalı.";

                if (y < MIN_LAT || y > MAX_LAT)
                    return $"Enlem {MIN_LAT}–{MAX_LAT} aralığında olmalı.";

                return null;
            }
            catch (System.Exception ex)
            {
                return $"Koordinat doğrulama hatası: {ex.Message}";
            }
        }

        public async Task<Response<PointReadDto>> AddPointAsync(PointCreateDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Name))
                    return new Response<PointReadDto>("İsim alanı boş olamaz.");

                if (string.IsNullOrWhiteSpace(dto.Wkt))
                    return new Response<PointReadDto>("WKT verisi boş olamaz.");

                var entity = new ModelPoint
                {
                    Name = dto.Name.Trim(),
                    Location = dto.Geometry
                };

                var error = Validate(entity);
                if (error != null)
                    return new Response<PointReadDto>(error);

                await _repo.AddAsync(entity);
                await _repo.SaveChangesAsync();

                return new Response<PointReadDto>(PointReadDto.FromEntity(entity));
            }
            catch (System.ArgumentException ex)
            {
                return new Response<PointReadDto>($"WKT format hatası: {ex.Message}");
            }
            catch (System.Exception ex)
            {
                return new Response<PointReadDto>($"Sunucu hatası: {ex.Message}");
            }
        }

        public async Task<Response<PointReadDto>> AddManualPointAsync(ManualPointDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Name))
                    return new Response<PointReadDto>("İsim alanı boş olamaz.");

                var wkt = dto.ToWkt();
                var createDto = new PointCreateDto { Name = dto.Name, Wkt = wkt };

                return await AddPointAsync(createDto);
            }
            catch (System.Exception ex)
            {
                return new Response<PointReadDto>($"Manuel nokta ekleme hatası: {ex.Message}");
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
                return new Response<List<PointReadDto>>($"Veri getirme hatası: {ex.Message}");
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
                    .Select(PointReadDto.FromEntity)
                    .ToList();

                var pagedResponse = new PagedResponse<PointReadDto>(
                    dtos, request.Page, request.PageSize, totalCount, request.SearchTerm, request.GeometryType);

                return new Response<PagedResponse<PointReadDto>>(pagedResponse);
            }
            catch (System.Exception ex)
            {
                return new Response<PagedResponse<PointReadDto>>($"Sayfalı veri getirme hatası: {ex.Message}");
            }
        }

        public async Task<Response<PointReadDto>> GetByIdAsync(int id)
        {
            try
            {
                var p = await _repo.GetByIdAsync(id);
                if (p == null)
                    return new Response<PointReadDto>($"ID {id} bulunamadı.");

                return new Response<PointReadDto>(PointReadDto.FromEntity(p));
            }
            catch (System.Exception ex)
            {
                return new Response<PointReadDto>($"Veri getirme hatası: {ex.Message}");
            }
        }

        public async Task<Response<PointReadDto>> UpdatePointAsync(int id, PointCreateDto dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Name))
                    return new Response<PointReadDto>("İsim alanı boş olamaz.");

                if (string.IsNullOrWhiteSpace(dto.Wkt))
                    return new Response<PointReadDto>("WKT verisi boş olamaz.");

                var existing = await _repo.GetByIdAsync(id);
                if (existing == null)
                    return new Response<PointReadDto>($"ID {id} bulunamadı.");

                existing.Name = dto.Name.Trim();
                existing.Location = dto.Geometry;

                var error = Validate(existing);
                if (error != null)
                    return new Response<PointReadDto>(error);

                _repo.Update(existing);
                await _repo.SaveChangesAsync();

                return new Response<PointReadDto>(PointReadDto.FromEntity(existing));
            }
            catch (System.ArgumentException ex)
            {
                return new Response<PointReadDto>($"WKT format hatası: {ex.Message}");
            }
            catch (System.Exception ex)
            {
                return new Response<PointReadDto>($"Güncelleme hatası: {ex.Message}");
            }
        }

        public async Task<Response<object>> DeletePointAsync(int id)
        {
            try
            {
                var p = await _repo.GetByIdAsync(id);
                if (p == null)
                    return new Response<object>($"ID {id} bulunamadı.");

                _repo.Delete(p);
                await _repo.SaveChangesAsync();

                return new Response<object>(new
                {
                    id = id,
                    message = "Point başarıyla silindi",
                    type = "point"
                });
            }
            catch (System.Exception ex)
            {
                return new Response<object>($"Silme hatası: {ex.Message}");
            }
        }
    }
}