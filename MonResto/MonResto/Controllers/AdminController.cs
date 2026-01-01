using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MonResto.Models;
using MonResto.Services;

namespace MonResto.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = UserRole.Admin)]
    public class AdminController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ITableService _tableService;

        public AdminController(IAuthService authService, ITableService tableService)
        {
            _authService = authService;
            _tableService = tableService;
        }

        // Gestion des serveurs
        [HttpGet("serveurs")]
        public async Task<IActionResult> GetAllServeurs()
        {
            var serveurs = await _authService.GetUsersByRoleAsync(UserRole.Serveur);
            return Ok(serveurs.Select(s => new
            {
                s.Id,
                s.Username,
                s.FullName,
                s.Role
            }));
        }

        [HttpGet("serveurs/{id}")]
        public async Task<IActionResult> GetServeur(string id)
        {
            var serveur = await _authService.GetUserByIdAsync(id);
            if (serveur == null || serveur.Role != UserRole.Serveur)
            {
                return NotFound(new { message = "Serveur non trouvé" });
            }

            return Ok(new
            {
                serveur.Id,
                serveur.Username,
                serveur.FullName,
                serveur.Role
            });
        }

        [HttpPost("serveurs")]
        public async Task<IActionResult> CreateServeur([FromBody] CreateUserRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var serveur = new User
            {
                Username = request.Username,
                Password = request.Password,
                FullName = request.FullName,
                Role = UserRole.Serveur
            };

            var createdServeur = await _authService.CreateUserAsync(serveur);

            return CreatedAtAction(nameof(GetServeur), new { id = createdServeur.Id }, new
            {
                createdServeur.Id,
                createdServeur.Username,
                createdServeur.FullName,
                createdServeur.Role
            });
        }

        [HttpPut("serveurs/{id}")]
        public async Task<IActionResult> UpdateServeur(string id, [FromBody] UpdateUserRequest request)
        {
            var existingServeur = await _authService.GetUserByIdAsync(id);
            if (existingServeur == null || existingServeur.Role != UserRole.Serveur)
            {
                return NotFound(new { message = "Serveur non trouvé" });
            }

            var serveur = new User
            {
                Id = id,
                Username = request.Username,
                Password = request.Password,
                FullName = request.FullName,
                Role = UserRole.Serveur
            };

            var updatedServeur = await _authService.UpdateUserAsync(serveur);

            return Ok(new
            {
                updatedServeur.Id,
                updatedServeur.Username,
                updatedServeur.FullName,
                updatedServeur.Role
            });
        }

        [HttpDelete("serveurs/{id}")]
        public async Task<IActionResult> DeleteServeur(string id)
        {
            var serveur = await _authService.GetUserByIdAsync(id);
            if (serveur == null || serveur.Role != UserRole.Serveur)
            {
                return NotFound(new { message = "Serveur non trouvé" });
            }

            var deleted = await _authService.DeleteUserAsync(id);
            if (deleted)
            {
                return Ok(new { message = "Serveur supprimé avec succès" });
            }

            return BadRequest(new { message = "Erreur lors de la suppression" });
        }

        // Gestion des cuisiniers
        [HttpGet("cuisiniers")]
        public async Task<IActionResult> GetAllCuisiniers()
        {
            var cuisiniers = await _authService.GetUsersByRoleAsync(UserRole.Cuisinier);
            return Ok(cuisiniers.Select(c => new
            {
                c.Id,
                c.Username,
                c.FullName,
                c.Role
            }));
        }

        [HttpGet("cuisiniers/{id}")]
        public async Task<IActionResult> GetCuisinier(string id)
        {
            var cuisinier = await _authService.GetUserByIdAsync(id);
            if (cuisinier == null || cuisinier.Role != UserRole.Cuisinier)
            {
                return NotFound(new { message = "Cuisinier non trouvé" });
            }

            return Ok(new
            {
                cuisinier.Id,
                cuisinier.Username,
                cuisinier.FullName,
                cuisinier.Role
            });
        }

        [HttpPost("cuisiniers")]
        public async Task<IActionResult> CreateCuisinier([FromBody] CreateUserRequest request)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var cuisinier = new User
            {
                Username = request.Username,
                Password = request.Password,
                FullName = request.FullName,
                Role = UserRole.Cuisinier
            };

            var createdCuisinier = await _authService.CreateUserAsync(cuisinier);

            return CreatedAtAction(nameof(GetCuisinier), new { id = createdCuisinier.Id }, new
            {
                createdCuisinier.Id,
                createdCuisinier.Username,
                createdCuisinier.FullName,
                createdCuisinier.Role
            });
        }

        [HttpPut("cuisiniers/{id}")]
        public async Task<IActionResult> UpdateCuisinier(string id, [FromBody] UpdateUserRequest request)
        {
            var existingCuisinier = await _authService.GetUserByIdAsync(id);
            if (existingCuisinier == null || existingCuisinier.Role != UserRole.Cuisinier)
            {
                return NotFound(new { message = "Cuisinier non trouvé" });
            }

            var cuisinier = new User
            {
                Id = id,
                Username = request.Username,
                Password = request.Password,
                FullName = request.FullName,
                Role = UserRole.Cuisinier
            };

            var updatedCuisinier = await _authService.UpdateUserAsync(cuisinier);

            return Ok(new
            {
                updatedCuisinier.Id,
                updatedCuisinier.Username,
                updatedCuisinier.FullName,
                updatedCuisinier.Role
            });
        }

        [HttpDelete("cuisiniers/{id}")]
        public async Task<IActionResult> DeleteCuisinier(string id)
        {
            var cuisinier = await _authService.GetUserByIdAsync(id);
            if (cuisinier == null || cuisinier.Role != UserRole.Cuisinier)
            {
                return NotFound(new { message = "Cuisinier non trouvé" });
            }

            var deleted = await _authService.DeleteUserAsync(id);
            if (deleted)
            {
                return Ok(new { message = "Cuisinier supprimé avec succès" });
            }

            return BadRequest(new { message = "Erreur lors de la suppression" });
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var users = await _authService.GetAllUsersAsync();
            var tables = await _tableService.GetAllTablesAsync();

            return Ok(new
            {
                totalServeurs = users.Count(u => u.Role == UserRole.Serveur),
                totalCuisiniers = users.Count(u => u.Role == UserRole.Cuisinier),
                totalAdmins = users.Count(u => u.Role == UserRole.Admin),
                totalTables = tables.Count,
                tablesLibres = tables.Count(t => t.Statut == TableStatut.Libre),
                tablesOccupees = tables.Count(t => t.Statut == TableStatut.Occupee),
                tablesReservees = tables.Count(t => t.Statut == TableStatut.Reservee)
            });
        }
    }
}
