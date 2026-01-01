using Microsoft.AspNetCore.Mvc;
using MonResto.Services;

namespace MonResto.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TableController : ControllerBase
    {
        private readonly ITableService _tableService;

        public TableController(ITableService tableService)
        {
            _tableService = tableService;
        }

        [HttpGet("qrcode/{qrCodeUrl}")]
        public async Task<IActionResult> GetTableByQrCode(string qrCodeUrl)
        {
            var table = await _tableService.GetTableByQrCodeAsync(qrCodeUrl);
            if (table == null)
            {
                return NotFound(new { message = "Table non trouvée" });
            }
            return Ok(table);
        }

        [HttpGet("{id}/qrcode-url")]
        public async Task<IActionResult> GetQrCodeUrl(string id)
        {
            var url = await _tableService.GenerateQrCodeUrlAsync(id);
            if (url == null)
            {
                return NotFound();
            }
            return Ok(new { url = url, qrCodeImage = $"https://api.qrserver.com/v1/create-qr-code/?size=300x300&data={url}" });
        }
    }
}
