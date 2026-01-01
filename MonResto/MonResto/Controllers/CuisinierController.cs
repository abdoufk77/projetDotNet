using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MonResto.Models;
using MonResto.Services;

namespace MonResto.Controllers
{
    [Authorize(Roles = "Cuisinier,Admin")]
    [Route("api/[controller]")]
    [ApiController]
    public class CuisinierController : ControllerBase
    {
        private readonly IMenuService _menuService;
        private readonly ICommandeService _commandeService;
        private readonly IAuthService _authService;
        private readonly ITableService _tableService;

        public CuisinierController(IMenuService menuService, ICommandeService commandeService, IAuthService authService, ITableService tableService)
        {
            _menuService = menuService;
            _commandeService = commandeService;
            _authService = authService;
            _tableService = tableService;
        }

        // ========== GESTION DES COMMANDES ==========

        [HttpGet("commandes")]
        public async Task<IActionResult> GetCommandes()
        {
            var commandes = await _commandeService.GetAllCommandesAsync();
            var commandesDto = await EnrichCommandesWithTableNumber(commandes);
            return Ok(commandesDto);
        }

        [HttpGet("commandes/en-attente")]
        public async Task<IActionResult> GetCommandesEnAttente()
        {
            var commandes = await _commandeService.GetAllCommandesAsync();

            var filtered = commandes.Where(c => c.Statut == CommandeStatut.EnAttente)
                .OrderBy(c => c.DateCommande)
                .ToList();
            
            var commandesDto = await EnrichCommandesWithTableNumber(filtered);
            return Ok(commandesDto);
        }

        [HttpGet("commandes/en-preparation")]
        public async Task<IActionResult> GetCommandesEnPreparation()
        {
            var commandes = await _commandeService.GetAllCommandesAsync();

            var filtered = commandes.Where(c => c.Statut == CommandeStatut.EnPreparation)
                .OrderBy(c => c.DateCommande)
                .ToList();
            
            var commandesDto = await EnrichCommandesWithTableNumber(filtered);
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
            var commandeDto = new CommandeDto
            {
                Id = commande.Id,
                TableId = commande.TableId,
                NumeroTable = table?.NumeroTable ?? 0,
                Items = commande.Items,
                Total = commande.Total,
                Statut = commande.Statut,
                DateCommande = commande.DateCommande,
                Notes = commande.Notes
            };

            return Ok(commandeDto);
        }

        [HttpPut("commandes/{id}/statut")]
        public async Task<IActionResult> UpdateStatut(string id, [FromBody] UpdateStatutRequest request)
        {
            var commande = await _commandeService.GetCommandeByIdAsync(id);
            if (commande == null)
            {
                return NotFound(new { message = "Commande non trouvée" });
            }

            var validStatuts = new[] {
                CommandeStatut.EnAttente,
                CommandeStatut.EnPreparation,
                CommandeStatut.Prete
            };

            if (!validStatuts.Contains(request.Statut))
            {
                return BadRequest(new { message = "Statut invalide pour le cuisinier" });
            }

            var updatedCommande = await _commandeService.UpdateStatutAsync(id, request.Statut);
            if (updatedCommande == null)
            {
                return StatusCode(500, new { message = "Erreur lors de la mise à jour" });
            }

            return Ok(updatedCommande);
        }

        [HttpPut("commandes/{id}/demarrer")]
        public async Task<IActionResult> DemarrerPreparation(string id)
        {
            var commande = await _commandeService.GetCommandeByIdAsync(id);
            if (commande == null)
            {
                return NotFound(new { message = "Commande non trouvée" });
            }

            if (commande.Statut != CommandeStatut.EnAttente)
            {
                return BadRequest(new { message = "La commande n'est pas en attente" });
            }

            var updatedCommande = await _commandeService.UpdateStatutAsync(id, CommandeStatut.EnPreparation);
            return Ok(updatedCommande);
        }

        [HttpPut("commandes/{id}/terminer")]
        public async Task<IActionResult> TerminerPreparation(string id)
        {
            var commande = await _commandeService.GetCommandeByIdAsync(id);
            if (commande == null)
            {
                return NotFound(new { message = "Commande non trouvée" });
            }

            if (commande.Statut != CommandeStatut.EnPreparation)
            {
                return BadRequest(new { message = "La commande n'est pas en préparation" });
            }

            var updatedCommande = await _commandeService.UpdateStatutAsync(id, CommandeStatut.Prete);
            return Ok(updatedCommande);
        }

        [HttpGet("commandes/stats")]
        public async Task<IActionResult> GetCommandesStats()
        {
            var commandes = await _commandeService.GetAllCommandesAsync();
            var aujourdHui = DateTime.Today;

            return Ok(new
            {
                totalCommandes = commandes.Count,
                enAttente = commandes.Count(c => c.Statut == CommandeStatut.EnAttente),
                enPreparation = commandes.Count(c => c.Statut == CommandeStatut.EnPreparation),
                pretes = commandes.Count(c => c.Statut == CommandeStatut.Prete),
                servies = commandes.Count(c => c.Statut == CommandeStatut.Servie),
                commandesAujourdHui = commandes.Count(c => c.DateCommande.Date == aujourdHui)
            });
        }

        // ========== GESTION DU MENU ==========

        [HttpGet("menu")]
        public async Task<IActionResult> GetAllMenuItems()
        {
            var menuItems = await _menuService.GetAllMenuItemsAsync();
            return Ok(menuItems);
        }

        [HttpGet("menu/{id}")]
        public async Task<IActionResult> GetMenuItem(string id)
        {
            var item = await _menuService.GetMenuItemByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "Item non trouvé" });
            }
            return Ok(item);
        }

        [HttpPost("menu")]
        public async Task<IActionResult> CreateMenuItem([FromBody] MenuItem item)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (string.IsNullOrWhiteSpace(item.Nom))
            {
                return BadRequest(new { message = "Le nom est requis" });
            }

            if (item.Prix <= 0)
            {
                return BadRequest(new { message = "Le prix doit être supérieur à 0" });
            }

            var validCategories = new[] {
                MenuCategorie.Entree,
                MenuCategorie.Plat,
                MenuCategorie.Dessert,
                MenuCategorie.Boisson
            };

            if (!validCategories.Contains(item.Categorie))
            {
                return BadRequest(new { message = "Catégorie invalide" });
            }

            var newItem = await _menuService.CreateMenuItemAsync(item);
            return CreatedAtAction(nameof(GetMenuItem), new { id = newItem.Id }, newItem);
        }

        [HttpPut("menu/{id}")]
        public async Task<IActionResult> UpdateMenuItem(string id, [FromBody] MenuItem item)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (id != item.Id)
            {
                return BadRequest(new { message = "L'ID ne correspond pas" });
            }

            var existingItem = await _menuService.GetMenuItemByIdAsync(id);
            if (existingItem == null)
            {
                return NotFound(new { message = "Item non trouvé" });
            }

            if (string.IsNullOrWhiteSpace(item.Nom))
            {
                return BadRequest(new { message = "Le nom est requis" });
            }

            if (item.Prix <= 0)
            {
                return BadRequest(new { message = "Le prix doit être supérieur à 0" });
            }

            var updatedItem = await _menuService.UpdateMenuItemAsync(item);
            if (updatedItem == null)
            {
                return StatusCode(500, new { message = "Erreur lors de la mise à jour" });
            }

            return Ok(updatedItem);
        }

        [HttpDelete("menu/{id}")]
        public async Task<IActionResult> DeleteMenuItem(string id)
        {
            var item = await _menuService.GetMenuItemByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "Item non trouvé" });
            }

            var success = await _menuService.DeleteMenuItemAsync(id);
            if (!success)
            {
                return StatusCode(500, new { message = "Erreur lors de la suppression" });
            }

            return Ok(new { message = "Item supprimé avec succès" });
        }

        [HttpPatch("menu/{id}/disponibilite")]
        public async Task<IActionResult> UpdateDisponibilite(string id, [FromBody] DisponibiliteRequest request)
        {
            var item = await _menuService.GetMenuItemByIdAsync(id);
            if (item == null)
            {
                return NotFound(new { message = "Item non trouvé" });
            }

            var updatedItem = await _menuService.UpdateDisponibiliteAsync(id, request.Disponible);
            if (updatedItem == null)
            {
                return StatusCode(500, new { message = "Erreur lors de la mise à jour" });
            }

            return Ok(updatedItem);
        }

        [HttpGet("menu/categories")]
        public IActionResult GetCategories()
        {
            var categories = new[]
            {
                MenuCategorie.Entree,
                MenuCategorie.Plat,
                MenuCategorie.Dessert,
                MenuCategorie.Boisson
            };

            return Ok(categories);
        }

        [HttpGet("menu/stats")]
        public async Task<IActionResult> GetMenuStats()
        {
            var menuItems = await _menuService.GetAllMenuItemsAsync();

            return Ok(new
            {
                totalPlats = menuItems.Count,
                disponibles = menuItems.Count(m => m.Disponible),
                entrees = menuItems.Count(m => m.Categorie == MenuCategorie.Entree),
                plats = menuItems.Count(m => m.Categorie == MenuCategorie.Plat),
                desserts = menuItems.Count(m => m.Categorie == MenuCategorie.Dessert),
                boissons = menuItems.Count(m => m.Categorie == MenuCategorie.Boisson)
            });
        }

        // ========== HELPER METHODS ==========

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

    public class DisponibiliteRequest
    {
        public bool Disponible { get; set; }
    }
}