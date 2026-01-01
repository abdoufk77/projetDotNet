using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MonResto.Models;
using MonResto.Services;

namespace MonResto.Controllers
{
    [Authorize(Roles = "Serveur,Admin")]
    [Route("api/[controller]")]
    [ApiController]
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
        public async Task<IActionResult> GetTable(string id)
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
        public async Task<IActionResult> UpdateTable(string id, [FromBody] Table table)
        {
            if (id != table.Id) return BadRequest(new { message = "ID mismatch" });
            var updated = await _tableService.UpdateTableAsync(table);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpDelete("tables/{id}")]
        public async Task<IActionResult> DeleteTable(string id)
        {
            var result = await _tableService.DeleteTableAsync(id);
            if (!result) return NotFound();
            return Ok(new { message = "Table supprimée" });
        }

        [HttpPut("tables/{id}/statut")]
        public async Task<IActionResult> UpdateTableStatut(string id, [FromBody] UpdateStatutRequest request)
        {
            var updated = await _tableService.UpdateStatutAsync(id, request.Statut);
            if (updated == null) return NotFound();
            return Ok(updated);
        }

        [HttpGet("tables/{id}/qrcode")]
        public async Task<IActionResult> GetQrCode(string id)
        {
           var qrBytes = await _tableService.GenerateQrCodeImageAsync(id);
           return File(qrBytes, "image/png");
        }

        [HttpGet("tables/{id}/qrcode-url")]
        public async Task<IActionResult> GetQrCodeUrl(string id)
        {
            var url = await _tableService.GenerateQrCodeUrlAsync(id);
            return Ok(new { url });
        }

        // ===== GESTION DES COMMANDES =====

        [HttpGet("commandes")]
        public async Task<IActionResult> GetAllCommandes()
        {
            var commandes = await _commandeService.GetAllCommandesAsync();
            var commandesDto = await EnrichCommandesWithTableNumber(commandes);
            return Ok(commandesDto);
        }

        [HttpGet("commandes/{id}")]
        public async Task<IActionResult> GetCommande(string id)
        {
            var commande = await _commandeService.GetCommandeByIdAsync(id);
            if (commande == null)
            {
                return NotFound(new { message = "Commande non trouvée" });
            }
            
             var table = await _tableService.GetTableByIdAsync(commande.TableId);
             var dto = new CommandeDto {
                 Id = commande.Id,
                 TableId = commande.TableId,
                 NumeroTable = table?.NumeroTable ?? 0,
                 Items = commande.Items,
                 Total = commande.Total,
                 Statut = commande.Statut,
                 DateCommande = commande.DateCommande,
                 Notes = commande.Notes
             };
            return Ok(dto);
        }

        [HttpPut("commandes/{id}/statut")]
        public async Task<IActionResult> UpdateCommandeStatut(string id, [FromBody] UpdateStatutRequest request)
        {
            var commande = await _commandeService.UpdateStatutAsync(id, request.Statut);
            if (commande == null)
            {
                return NotFound(new { message = "Commande non trouvée" });
            }
            return Ok(commande);
        }

        // ===== HELPER METHODS =====
        private async Task<List<CommandeDto>> EnrichCommandesWithTableNumber(List<Commande> commandes)
        {
            var commandesDto = new List<CommandeDto>();
            foreach (var commande in commandes)
            {
                var table = await _tableService.GetTableByIdAsync(commande.TableId);
                commandesDto.Add(new CommandeDto
                {
                    Id = commande.Id,
                    TableId = commande.TableId,
                    NumeroTable = table?.NumeroTable ?? 0,
                    Items = commande.Items,
                    Total = commande.Total,
                    Statut = commande.Statut,
                    DateCommande = commande.DateCommande,
                    Notes = commande.Notes
                });
            }
            return commandesDto;
        }
    }

    public class UpdateStatutRequest
    {
        public string Statut { get; set; } = string.Empty;
    }
}
