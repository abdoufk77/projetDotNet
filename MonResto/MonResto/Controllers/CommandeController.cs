using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MonResto.Models;
using MonResto.Services;

namespace MonResto.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommandeController : ControllerBase
    {
        private readonly ICommandeService _commandeService;
        private readonly ITableService _tableService;

        public CommandeController(ICommandeService commandeService, ITableService tableService)
        {
            _commandeService = commandeService;
            _tableService = tableService;
        }

        [HttpPost("create")]
        public async Task<IActionResult> CreateCommande([FromBody] CreateCommandeRequest request)
        {
            try
            {
                var table = await _tableService.GetTableByIdAsync(request.TableId);
                if (table == null)
                {
                    return NotFound(new { message = "Table non trouvée" });
                }

                var commande = await _commandeService.CreateCommandeAsync(request);
                return Ok(new
                {
                    message = "Commande créée avec succès",
                    commandeId = commande.Id,
                    total = commande.Total
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        // Endpoints protégés pour le personnel
        [HttpGet]
        [Authorize(Roles = $"{UserRole.Admin},{UserRole.Serveur},{UserRole.Cuisinier}")]
        public async Task<IActionResult> GetAllCommandes()
        {
            var commandes = await _commandeService.GetAllCommandesAsync();
            return Ok(commandes);
        }

        [HttpGet("table/{tableId}")]
        [Authorize(Roles = $"{UserRole.Admin},{UserRole.Serveur},{UserRole.Cuisinier}")]
        public async Task<IActionResult> GetCommandesByTable(string tableId)
        {
            var commandes = await _commandeService.GetCommandesByTableAsync(tableId);
            return Ok(commandes);
        }

        [HttpGet("{id}")]
        [Authorize(Roles = $"{UserRole.Admin},{UserRole.Serveur},{UserRole.Cuisinier}")]
        public async Task<IActionResult> GetCommande(string id)
        {
            var commande = await _commandeService.GetCommandeByIdAsync(id);
            if (commande == null)
            {
                return NotFound();
            }
            return Ok(commande);
        }

        [HttpPut("{id}/statut")]
        [Authorize(Roles = $"{UserRole.Cuisinier},{UserRole.Serveur}")]
        public async Task<IActionResult> UpdateStatut(string id, [FromBody] UpdateStatutCommandeRequest request)
        {
            if (string.IsNullOrEmpty(request.Statut))
            {
                return BadRequest(new { message = "Le statut est requis" });
            }

            var commande = await _commandeService.UpdateStatutAsync(id, request.Statut);
            if (commande == null)
            {
                return NotFound(new { message = "Commande non trouvée" });
            }
            return Ok(commande);
        }

        [HttpGet("stats")]
        [Authorize(Roles = $"{UserRole.Admin},{UserRole.Cuisinier}")]
        public async Task<IActionResult> GetStats()
        {
            var commandes = await _commandeService.GetAllCommandesAsync();

            return Ok(new
            {
                totalCommandes = commandes.Count,
                enAttente = commandes.Count(c => c.Statut == CommandeStatut.EnAttente),
                enPreparation = commandes.Count(c => c.Statut == CommandeStatut.EnPreparation),
                pretes = commandes.Count(c => c.Statut == CommandeStatut.Prete),
                servies = commandes.Count(c => c.Statut == CommandeStatut.Servie)
            });
        }
    }

    public class UpdateStatutCommandeRequest
    {
        public string Statut { get; set; } = string.Empty;
    }
}
