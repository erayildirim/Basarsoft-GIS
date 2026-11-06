using Microsoft.AspNetCore.Mvc;
using Basarsoft.Interfaces;
using Basarsoft.Dtos;

namespace Basarsoft.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LineController : ControllerBase
    {
        private readonly ILineService _svc;
        private readonly ILogger<LineController> _logger;

        public LineController(ILineService svc, ILogger<LineController> logger)
        {
            _svc = svc;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> Add([FromBody] LineCreateDto dto)
        {
            try
            {
                _logger.LogInformation("Adding line: {@Dto}", dto);

                if (dto == null)
                    return BadRequest("DTO is null");

                var r = await _svc.AddLineAsync(dto);
                if (!r.Success) return BadRequest(r);
                return CreatedAtAction(nameof(GetById), new { id = r.Data.Id }, r.Data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding line: {@Dto}", dto);
                return StatusCode(500, new { message = "Sunucu hatası: " + ex.Message });
            }
        }

        [HttpPost("manual")]
        public async Task<IActionResult> AddManual([FromBody] ManualLineDto dto)
        {
            try
            {
                _logger.LogInformation("Adding manual line: {@Dto}", dto);

                if (dto == null)
                    return BadRequest("DTO is null");

                var r = await _svc.AddManualLineAsync(dto);
                if (!r.Success) return BadRequest(r);
                return CreatedAtAction(nameof(GetById), new { id = r.Data.Id }, r.Data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error adding manual line: {@Dto}", dto);
                return StatusCode(500, new { message = "Sunucu hatası: " + ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var r = await _svc.GetAllLinesAsync();
                if (!r.Success) return StatusCode(500, r);
                return Ok(r.Data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting all lines");
                return StatusCode(500, new { message = "Sunucu hatası: " + ex.Message });
            }
        }

        [HttpGet("paged")]
        public async Task<IActionResult> GetPaged([FromQuery] PagedRequest request)
        {
            try
            {
                var r = await _svc.GetPagedLinesAsync(request);
                if (!r.Success) return StatusCode(500, r);
                return Ok(r.Data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting paged lines: {@Request}", request);
                return StatusCode(500, new { message = "Sunucu hatası: " + ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            try
            {
                var r = await _svc.GetLineByIdAsync(id);
                if (!r.Success) return NotFound(r);
                return Ok(r.Data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting line by id: {Id}", id);
                return StatusCode(500, new { message = "Sunucu hatası: " + ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] LineCreateDto dto)
        {
            try
            {
                _logger.LogInformation("Updating line {Id}: {@Dto}", id, dto);

                if (dto == null)
                    return BadRequest("DTO is null");

                var r = await _svc.UpdateLineAsync(id, dto);
                if (!r.Success) return BadRequest(r);
                return Ok(r.Data);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating line {Id}: {@Dto}", id, dto);
                return StatusCode(500, new { message = "Sunucu hatası: " + ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                var r = await _svc.DeleteLineAsync(id);
                if (!r.Success)
                    return NotFound(r);

                return Ok(new
                {
                    success = true,
                    message = "Line deleted successfully",
                    id = id
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting line: {Id}", id);
                return StatusCode(500, new
                {
                    success = false,
                    message = "Sunucu hatası: " + ex.Message
                });
            }
        }
    }
}