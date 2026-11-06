using Microsoft.AspNetCore.Mvc;
using Basarsoft.Interfaces;

namespace Basarsoft.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SearchController : ControllerBase
    {
        private readonly ISearchService _searchService;
        private readonly ILogger<SearchController> _logger;

        public SearchController(ISearchService searchService, ILogger<SearchController> logger)
        {
            _searchService = searchService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] string searchTerm, [FromQuery] string? geometryType = null, [FromQuery] int maxResults = 20)
        {
            try
            {
                _logger.LogInformation("Searching: {SearchTerm}, Type: {GeometryType}, MaxResults: {MaxResults}",
                    searchTerm, geometryType, maxResults);

                if (string.IsNullOrWhiteSpace(searchTerm))
                    return BadRequest("Search term is required");

                if (maxResults <= 0 || maxResults > 100)
                    maxResults = 20;

                var result = await _searchService.SearchAsync(searchTerm, geometryType, maxResults);

                if (!result.Success)
                    return StatusCode(500, result);

                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error searching: {SearchTerm}", searchTerm);
                return StatusCode(500, new { message = "Search error: " + ex.Message });
            }
        }
    }
}