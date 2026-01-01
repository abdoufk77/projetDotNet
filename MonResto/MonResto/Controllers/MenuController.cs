using Microsoft.AspNetCore.Mvc;
using MonResto.Services;

namespace MonResto.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MenuController : ControllerBase
    {
        private readonly IMenuService _menuService;

        public MenuController(IMenuService menuService)
        {
            _menuService = menuService;
        }

        [HttpGet]
        public async Task<IActionResult> GetMenu()
        {
            var menu = await _menuService.GetAvailableMenuItemsAsync();
            var groupedMenu = menu.GroupBy(m => m.Categorie)
                                 .Select(g => new { Categorie = g.Key, Items = g.ToList() });
            return Ok(groupedMenu);
        }

        [HttpGet("categorie/{categorie}")]
        public async Task<IActionResult> GetByCategorie(string categorie)
        {
            var items = await _menuService.GetMenuItemsByCategorieAsync(categorie);
            return Ok(items);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMenuItem(string id)
        {
            var item = await _menuService.GetMenuItemByIdAsync(id);
            if (item == null)
            {
                return NotFound();
            }
            return Ok(item);
        }
    }
}
