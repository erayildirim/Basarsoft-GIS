using Microsoft.AspNetCore.Mvc;
using Basarsoft.Interfaces;
using Basarsoft.Dtos;

namespace Basarsoft.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PointController : ControllerBase
    {
        private readonly IPointService _service;
        private readonly ILogger<PointController> _logger;

        public PointController(IPointService service, ILogger<PointController> logger)
        {
            _service = service;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> AddPoint([FromBody] PointCreateDto dto)
        {
            try
            {
                _logger.LogInformation("Adding point: {@Dto}", dto);

                if (dto == null)
                    return BadRequest("DTO is null");

                var result = await _service.AddPointAsync(dto);
                if (!result.Success)
                    return BadRequest(result);

                return CreatedAtAction(nameof(GetById), new { id = result.Data.Id }, result.Data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding point: {@Dto}", dto);
                return StatusCode(500, new { message = "Sunucu hatası: " + ex.Message });
            }
        }

        [HttpPost("manual")]
        public async Task<IActionResult> AddManualPoint([FromBody] ManualPointDto dto)
        {
            try
            {
                _logger.LogInformation("Adding manual point: {@Dto}", dto);

                if (dto == null)
                    return BadRequest("DTO is null");

                var result = await _service.AddManualPointAsync(dto);
                if (!result.Success)
                    return BadRequest(result);

                return CreatedAtAction(nameof(GetById), new { id = result.Data.Id }, result.Data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding manual point: {@Dto}", dto);
                return StatusCode(500, new { message = "Sunucu hatası: " + ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var result = await _service.GetAllPointsAsync();
                if (!result.Success)
                    return StatusCode(500, result);
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all points");
                return StatusCode(500, new { message = "Sunucu hatası: " + ex.Message });
            }
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged([FromQuery] PagedRequest request)
        {
            try
            {
                var result = await _service.GetPagedPointsAsync(request);
                if (!result.Success)
                    return StatusCode(500, result);
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting paged points: {@Request}", request);
                return StatusCode(500, new { message = "Sunucu hatası: " + ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var result = await _service.GetByIdAsync(id);
                if (!result.Success)
                    return NotFound(result);
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting point by id: {Id}", id);
                return StatusCode(500, new { message = "Sunucu hatası: " + ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] PointCreateDto dto)
        {
            try
            {
                _logger.LogInformation("Updating point {Id}: {@Dto}", id, dto);

                if (dto == null)
                    return BadRequest("DTO is null");

                var result = await _service.UpdatePointAsync(id, dto);
                if (!result.Success)
                    return BadRequest(result);
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating point {Id}: {@Dto}", id, dto);
                return StatusCode(500, new { message = "Sunucu hatası: " + ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var result = await _service.DeletePointAsync(id);
                if (!result.Success)
                    return NotFound(result);

                return Ok(new
                {
                    success = true,
                    message = "Point deleted successfully",
                    id = id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting point: {Id}", id);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Sunucu hatası: " + ex.Message
                });
            }
        }
    }
}