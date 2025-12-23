using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MonResto.Models;
using MonResto.Services;

namespace MonResto.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = UserRole.Serveur)]
    public class ServeurController : ControllerBase
    {
        private readonly ITableService _tableService;
        private readonly ICommandeService _commandeService;

        public ServeurController(ITableService tableService, ICommandeService commandeService)
        {
            _tableService = tableService;
            _commandeService = commandeService;
        }

        // ===== GESTION DES TABLES =====

        [HttpGet("tables")]
        public async Task<IActionResult> GetAllTables()
        {
            var tables = await _tableService.GetAllTablesAsync();
            return Ok(tables);
        }

        [HttpGet("tables/{id}")]
        public async Task<IActionResult> GetTable(int id)
        {
            var table = await _tableService.GetTableByIdAsync(id);
            if (table == null)
            {
                return NotFound(new { message = "Table non trouvée" });
            }
            return Ok(table);
        }

        [HttpPost("tables")]
        public async Task<IActionResult> CreateTable([FromBody] Table table)
        {
            var createdTable = await _tableService.CreateTableAsync(table);
            return CreatedAtAction(nameof(GetTable), new { id = createdTable.Id }, createdTable);
        }

        [HttpPut("tables/{id}")]
        public async Task<IActionResult> UpdateTable(int id, [FromBody] Table table)
        {
            table.Id = id;
            var updatedTable = await _tableService.UpdateTableAsync(table);
            if (updatedTable == null)
            {
                return NotFound(new { message = "Table non trouvée" });
            }
            return Ok(updatedTable);
        }

        [HttpDelete("tables/{id}")]
        public async Task<IActionResult> DeleteTable(int id)
        {
            var deleted = await _tableService.DeleteTableAsync(id);
            if (deleted)
            {
                return Ok(new { message = "Table supprimée avec succès" });
            }
            return NotFound(new { message = "Table non trouvée" });
        }

        [HttpPut("tables/{id}/statut")]
        public async Task<IActionResult> UpdateStatut(int id, [FromBody] UpdateStatutRequest request)
        {
            var table = await _tableService.UpdateStatutAsync(id, request.Statut);
            if (table == null)
            {
                return NotFound(new { message = "Table non trouvée" });
            }
            return Ok(table);
        }

        [HttpGet("tables/{id}/qrcode")]
        public async Task<IActionResult> GetQrCode(int id)
        {
            var qrCodeImage = await _tableService.GenerateQrCodeImageAsync(id);
            if (qrCodeImage == null)
            {
                return NotFound(new { message = "Table non trouvée" });
            }
            return File(qrCodeImage, "image/png");
        }

        [HttpGet("tables/{id}/qrcode-url")]
        public async Task<IActionResult> GetQrCodeUrl(int id)
        {
            var url = await _tableService.GenerateQrCodeUrlAsync(id);
            if (url == null)
            {
                return NotFound(new { message = "Table non trouvée" });
            }
            return Ok(new { url = url });
        }

        // ===== GESTION DES COMMANDES =====

        [HttpGet("commandes")]
        public async Task<IActionResult> GetAllCommandes()
        {
            var commandes = await _commandeService.GetAllCommandesAsync();
            return Ok(commandes);
        }

        [HttpGet("commandes/{id}")]
        public async Task<IActionResult> GetCommande(int id)
        {
            var commande = await _commandeService.GetCommandeByIdAsync(id);
            if (commande == null)
            {
                return NotFound(new { message = "Commande non trouvée" });
            }
            return Ok(commande);
        }

        [HttpPut("commandes/{id}/statut")]
        public async Task<IActionResult> UpdateCommandeStatut(int id, [FromBody] UpdateStatutCommandeRq request)
        {
            var commande = await _commandeService.UpdateStatutAsync(id, request.Statut);
            if (commande == null)
            {
                return NotFound(new { message = "Commande non trouvée" });
            }
            return Ok(commande);
        }
    }

    public class UpdateStatutRequest
    {
        public string Statut { get; set; } = string.Empty;
    }

}
