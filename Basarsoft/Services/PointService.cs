using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Basarsoft.Dtos;
using Basarsoft.Interfaces;
using NetTopologySuite.Geometries;
using ModelPoint = Basarsoft.Models.Point;

namespace Basarsoft.Services
{
    public class PointService : IPointService
    {
        private readonly IRepository<ModelPoint> _repo;

        // Türkiye coğrafi sınırları
        private const double MIN_LON = 25.0, MAX_LON = 46.0;
        private const double MIN_LAT = 35.0, MAX_LAT = 43.0;

        public PointService(IRepository<ModelPoint> repo)
        {
            _repo = repo;
        }

        private string Validate(ModelPoint p)
        {
            double x = p.Location.X;
            double y = p.Location.Y;
            if (x < MIN_LON || x > MAX_LON)
                return $"Boylam {MIN_LON}–{MAX_LON} aralığında olmalı.";
            if (y < MIN_LAT || y > MAX_LAT)
                return $"Enlem {MIN_LAT}–{MAX_LAT} aralığında olmalı.";
            return null;
        }

        public async Task<Response<PointReadDto>> AddPointAsync(PointCreateDto dto)
        {
            var entity = new ModelPoint
            {
                Name = dto.Name,
                Location = dto.Geometry
            };

            var error = Validate(entity);
            if (error != null)
                return new Response<PointReadDto>(error);

            await _repo.AddAsync(entity);
            await _repo.SaveChangesAsync();

            return new Response<PointReadDto>(PointReadDto.FromEntity(entity));
        }

        public async Task<Response<List<PointReadDto>>> GetAllPointsAsync()
        {
            var all = await _repo.GetAllAsync();
            var list = all
                .Select(p => PointReadDto.FromEntity(p))
                .ToList();
            return new Response<List<PointReadDto>>(list);
        }

        public async Task<Response<PointReadDto>> GetByIdAsync(int id)
        {
            var p = await _repo.GetByIdAsync(id);
            if (p == null)
                return new Response<PointReadDto>($"ID {id} bulunamadı.");
            return new Response<PointReadDto>(PointReadDto.FromEntity(p));
        }

        public async Task<Response<PointReadDto>> UpdatePointAsync(int id, PointCreateDto dto)
        {
            var existing = await _repo.GetByIdAsync(id);
            if (existing == null)
                return new Response<PointReadDto>($"ID {id} bulunamadı.");

            existing.Name = dto.Name;
            existing.Location = dto.Geometry;

            var error = Validate(existing);
            if (error != null)
                return new Response<PointReadDto>(error);

            _repo.Update(existing);
            await _repo.SaveChangesAsync();

            return new Response<PointReadDto>(PointReadDto.FromEntity(existing));
        }

        public async Task<Response<object>> DeletePointAsync(int id)
        {
            var p = await _repo.GetByIdAsync(id);
            if (p == null)
                return new Response<object>($"ID {id} bulunamadı.");

            _repo.Delete(p);
            await _repo.SaveChangesAsync();

            return new Response<object>("Silindi.");
        }
    }
}
