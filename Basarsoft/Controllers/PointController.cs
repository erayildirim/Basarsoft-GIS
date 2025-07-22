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
        public PointController(IPointService service)
        {
            _service = service;
        }

        [HttpPost]
        public async Task<IActionResult> AddPoint([FromBody] PointCreateDto dto)
        {
            try
            {
                var result = await _service.AddPointAsync(dto);
                if (!result.Success)
                    return BadRequest(result);
                return CreatedAtAction(nameof(GetById), new { id = result.Data.Id }, result.Data);
            }
            catch (Exception ex)
            {
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
                return StatusCode(500, new { message = "Sunucu hatası: " + ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] PointCreateDto dto)
        {
            try
            {
                var result = await _service.UpdatePointAsync(id, dto);
                if (!result.Success)
                    return BadRequest(result);
                return Ok(result.Data);
            }
            catch (Exception ex)
            {
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
                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Sunucu hatası: " + ex.Message });
            }
        }
    }
}
