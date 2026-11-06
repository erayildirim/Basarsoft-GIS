using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Basarsoft.Dtos;
using Basarsoft.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace Basarsoft.Services
{
    public class SearchService : ISearchService
    {
        private readonly ApplicationDbContext _context;

        public SearchService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Response<List<SearchResultDto>>> SearchAsync(string searchTerm, string? geometryType = null, int maxResults = 20)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(searchTerm))
                    return new Response<List<SearchResultDto>>(new List<SearchResultDto>());

                var results = new List<SearchResultDto>();

                
                if (string.IsNullOrEmpty(geometryType) || geometryType.ToLower() == "point")
                {
                    var points = await _context.Points
                        .Where(p => p.Name.Contains(searchTerm))
                        .Take(maxResults / 3)
                        .ToListAsync();

                    results.AddRange(points.Select(p => SearchResultDto.FromPoint(PointReadDto.FromEntity(p))));
                }

                
                if (string.IsNullOrEmpty(geometryType) || geometryType.ToLower() == "line")
                {
                    var lines = await _context.Lines
                        .Where(l => l.Name.Contains(searchTerm))
                        .Take(maxResults / 3)
                        .ToListAsync();

                    results.AddRange(lines.Select(l => SearchResultDto.FromLine(LineReadDto.FromEntity(l))));
                }

                
                if (string.IsNullOrEmpty(geometryType) || geometryType.ToLower() == "polygon")
                {
                    var polygons = await _context.Polygons
                        .Where(p => p.Name.Contains(searchTerm))
                        .Take(maxResults / 3)
                        .ToListAsync();

                    results.AddRange(polygons.Select(p => SearchResultDto.FromPolygon(PolygonReadDto.FromEntity(p))));
                }

                
                var sortedResults = results
                    .OrderBy(r => r.Name)
                    .Take(maxResults)
                    .ToList();

                return new Response<List<SearchResultDto>>(sortedResults);
            }
            catch (System.Exception ex)
            {
                return new Response<List<SearchResultDto>>($"Arama hatasý: {ex.Message}");
            }
        }
    }
}