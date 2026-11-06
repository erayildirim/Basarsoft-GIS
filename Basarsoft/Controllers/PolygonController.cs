using Microsoft.AspNetCore.Mvc;
using Basarsoft.Interfaces;
using Basarsoft.Dtos;

namespace Basarsoft.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PolygonController : ControllerBase
    {
        private readonly IPolygonService _svc;
        private readonly ILogger<PolygonController> _logger;

        public PolygonController(IPolygonService svc, ILogger<PolygonController> logger)
        {
            _svc = svc;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] PolygonCreateDto dto)
        {
            try
            {
                _logger.LogInformation("Adding polygon: {@Dto}", dto);

                if (dto == null)
                    return BadRequest("DTO is null");

                var r = await _svc.AddPolygonAsync(dto);
                if (!r.Success) return BadRequest(r);
                return CreatedAtAction(nameof(GetById), new { id = r.Data!.Id }, r.Data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding polygon: {@Dto}", dto);
                return StatusCode(500, new { message = "Server error: " + ex.Message });
            }
        }

        [HttpPost("manual")]
        public async Task<IActionResult> AddManual([FromBody] ManualPolygonDto dto)
        {
            try
            {
                _logger.LogInformation("Adding manual polygon: {@Dto}", dto);

                if (dto == null)
                    return BadRequest("DTO is null");

                var r = await _svc.AddManualPolygonAsync(dto);
                if (!r.Success) return BadRequest(r);
                return CreatedAtAction(nameof(GetById), new { id = r.Data!.Id }, r.Data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding manual polygon: {@Dto}", dto);
                return StatusCode(500, new { message = "Server error: " + ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var r = await _svc.GetAllPolygonsAsync();
                if (!r.Success) return StatusCode(500, r);
                return Ok(r.Data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all polygons");
                return StatusCode(500, new { message = "Server error: " + ex.Message });
            }
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged([FromQuery] PagedRequest request)
        {
            try
            {
                var r = await _svc.GetPagedPolygonsAsync(request);
                if (!r.Success) return StatusCode(500, r);
                return Ok(r.Data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting paged polygons: {@Request}", request);
                return StatusCode(500, new { message = "Server error: " + ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var r = await _svc.GetPolygonByIdAsync(id);
                if (!r.Success) return NotFound(r);
                return Ok(r.Data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting polygon by id: {Id}", id);
                return StatusCode(500, new { message = "Server error: " + ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] PolygonCreateDto dto)
        {
            try
            {
                _logger.LogInformation("Updating polygon {Id}: {@Dto}", id, dto);

                if (dto == null)
                    return BadRequest("DTO is null");

                var r = await _svc.UpdatePolygonAsync(id, dto);
                if (!r.Success) return BadRequest(r);
                return Ok(r.Data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating polygon {Id}: {@Dto}", id, dto);
                return StatusCode(500, new { message = "Server error: " + ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var r = await _svc.DeletePolygonAsync(id);
                if (!r.Success)
                    return NotFound(r);

                return Ok(new
                {
                    success = true,
                    message = "Polygon deleted successfully",
                    id = id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting polygon: {Id}", id);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Server error: " + ex.Message
                });
            }
        }
    }
}